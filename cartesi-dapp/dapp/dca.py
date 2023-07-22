# Copyright 2022 Cartesi Pte. Ltd.
#
# SPDX-License-Identifier: Apache-2.0
# Licensed under the Apache License, Version 2.0 (the "License"); you may not use
# this file except in compliance with the License. You may obtain a copy of the
# License at http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software distributed
# under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
# CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.

import json
import logging
import os
import traceback
from os import environ
from urllib.parse import parse_qs, urlparse

import requests
from dapp.amm import AMM
from dapp.constants import ZERO_ADDRESS
from dapp.eth_abi_ext import decode_packed
from dapp.streamabletoken import StreamableToken
from dapp.util import hex_to_str
from eth_abi.abi import encode
from eth_utils import to_checksum_address

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ.get("ROLLUP_HTTP_SERVER_URL", "http://127.0.0.1:5004")
logger.info(f"HTTP rollup_server url is {rollup_server}")

network = environ.get("NETWORK", "localhost")
ERC20PortalFile = open(f"./deployments/{network}/ERC20Portal.json")
erc20Portal = json.load(ERC20PortalFile)


def hex2str(hex):
    """
    Decodes a hex string into a regular string
    """
    return bytes.fromhex(hex[2:]).decode("utf-8")


def str2hex(str):
    """
    Encodes a string as a hex string
    """
    return "0x" + str.encode("utf-8").hex()


# Function selector to be called during the execution of a voucher that transfers funds,
# which corresponds to the first 4 bytes of the Keccak256-encoded result of "transfer(address,uint256)"
TRANSFER_FUNCTION_SELECTOR = b"\xa9\x05\x9c\xbb"


def reject_input(msg, payload):
    logger.error(msg)
    response = requests.post(rollup_server + "/report", json={"payload": payload})
    logger.info(
        f"Received report status {response.status_code} body {response.content}"
    )
    return "reject"


def get_storage():
    if os.path.exists("./storage/amm.json"):
        with open("./storage/amm.json", "r") as f:
            amm = json.load(f)
    else:
        amm = {}

    if os.path.exists("./storage/balances.json"):
        with open("./storage/balances.json", "r") as f:
            balances = json.load(f)
    else:
        balances = {}

    return amm, balances


def restore_storage(amm, balances):
    if not os.path.exists("./storage"):
        os.makedirs("./storage")

    with open("./storage/amm.json", "w") as f:
        json.dump(amm, f, indent=4)

    with open("./storage/balances.json", "w") as f:
        json.dump(balances, f, indent=4)


def handle_deposit(data):
    try:
        # Attempt to decode input as an ABI-packed-encoded ERC20 deposit
        binary = bytes.fromhex(data["payload"][2:])
        try:
            decoded = decode_packed(["bool", "address", "address", "uint256"], binary)
        except Exception as e:
            msg = "Payload does not conform to ERC20 deposit ABI"
            logger.error(f"{msg}\n{traceback.format_exc()}")
            return reject_input(msg, data["payload"])

        success = decoded[0]
        erc20 = decoded[1]
        depositor = decoded[2]
        amount = decoded[3]

        StreamableToken(erc20).mint(amount, depositor)

        # Post notice about the deposit and minting
        notice_str = f"Deposit received from: {depositor}; ERC-20: {erc20}; Amount: {amount} and minted to {depositor} \
              corresponding StreamableToken."
        logger.info(f"Adding notice: {notice_str}")
        notice = {"payload": str2hex(notice_str)}
        response = requests.post(rollup_server + "/notice", json=notice)
        logger.info(
            f"Received notice status {response.status_code} body {response.content}"
        )

        return "accept"

    except Exception as e:
        return reject_input(
            f"Error processing data {data}\n{traceback.format_exc()}", data["payload"]
        )


def handle_action(data):
    amm, balances = get_storage()
    try:
        str_payload = hex_to_str(data["payload"])
        payload = json.loads(str_payload)

        if payload["method"] == "add_liquidity":
            AMM().add_liquidity(
                token_a=payload["args"]["token_a"],
                token_b=payload["args"]["token_b"],
                token_a_desired=int(payload["args"]["token_a_desired"]),
                token_b_desired=int(payload["args"]["token_b_desired"]),
                token_a_min=int(payload["args"]["token_a_min"]),
                token_b_min=int(payload["args"]["token_b_min"]),
                to=payload["args"]["to"],
                msg_sender=data["metadata"]["msg_sender"],
                timestamp=int(data["metadata"]["timestamp"]),
            )
        elif payload["method"] == "remove_liquidity":
            AMM().remove_liquidity(
                token_a=payload["args"]["token_a"],
                token_b=payload["args"]["token_b"],
                liquidity=int(payload["args"]["liquidity"]),
                amount_a_min=int(payload["args"]["amount_a_min"]),
                amount_b_min=int(payload["args"]["amount_b_min"]),
                to=payload["args"]["to"],
                msg_sender=data["metadata"]["msg_sender"],
                timestamp=int(data["metadata"]["timestamp"]),
            )
        elif payload["method"] == "swap":
            AMM().swap_exact_tokens_for_tokens(
                amount_in=int(payload["args"]["amount_in"]),
                amount_out_min=int(payload["args"]["amount_out_min"]),
                path=payload["args"]["path"],
                start=int(payload["args"]["start"]),
                duration=int(payload["args"]["duration"]),
                to=payload["args"]["to"],
                msg_sender=data["metadata"]["msg_sender"],
                timestamp=int(data["metadata"]["timestamp"]),
            )
        elif payload["method"] == "stream":
            StreamableToken(payload["args"]["token"]).transfer_from(
                sender=data["metadata"]["msg_sender"],
                receiver=payload["args"]["receiver"],
                amount=int(payload["args"]["amount"]),
                duration=int(payload["args"]["duration"]),
                start=int(payload["args"]["start"]),
                timestamp=int(data["metadata"]["timestamp"]),
            )
        elif payload["method"] == "unwrap":
            token_address = payload["args"]["token"]
            token = StreamableToken(payload["args"]["token"])
            amount = int(payload["args"]["amount"])
            msg_sender = data["metadata"]["msg_sender"]
            token.burn(
                amount=amount,
                wallet=msg_sender,
                timestamp=int(data["metadata"]["timestamp"]),
            )
            # Encode a transfer function call that returns the amount back to the depositor
            transfer_payload = TRANSFER_FUNCTION_SELECTOR + encode(
                ["address", "uint256"], [msg_sender, amount]
            )
            # Post voucher executing the transfer on the ERC-20 contract: "I don't want your money"!
            voucher = {
                "destination": token_address,
                "payload": "0x" + transfer_payload.hex(),
            }
            logger.info(f"Issuing voucher {voucher}")
            response = requests.post(rollup_server + "/voucher", json=voucher)
            logger.info(
                f"Received voucher status {response.status_code} body {response.content}"
            )
        elif payload["method"] == "cancel_stream":
            token = StreamableToken(payload["args"]["token"])
            stream_id_to_cancel = payload["args"]["stream_id"]
            parent_id_to_cancel = payload["args"]["parent_id"]

            # TODO move this logic somewhere else
            amm_pairs = AMM().get_storage()["pairs"]
            streams = token.get_storage()["streams"]

            if parent_id_to_cancel is not None:
                related_streams = {
                    stream_id: stream
                    for stream_id, stream in streams.items()
                    if stream.get("parent_id", "") == parent_id_to_cancel
                    and to_checksum_address(stream["from"])
                    == to_checksum_address(data["metadata"]["msg_sender"])
                }
                # Cancel all related streams
                pairs_to_recalculate = set()
                for stream_id, stream in related_streams.items():
                    token.cancel_stream(
                        stream_id,
                        data["metadata"]["msg_sender"],
                        int(data["metadata"]["timestamp"]),
                    )
                    # Recalculate AMM pair if needed
                    if amm_pairs.get(stream["to"]) is not None:
                        pairs_to_recalculate.add(stream["to"])
                # Recalculate AMM pairs
                for pair_address in pairs_to_recalculate:
                    pair = amm_pairs.get(pair_address)
                    AMM().recalculate_pair(
                        pair.get("token_0"),
                        pair.get("token_1"),
                        int(data["metadata"]["timestamp"]),
                    )
            elif streams.get(stream_id_to_cancel) is not None:
                stream = streams.get(stream_id_to_cancel)
                token.cancel_stream(
                    stream_id_to_cancel,
                    data["metadata"]["msg_sender"],
                    int(data["metadata"]["timestamp"]),
                )
                # Recalculate AMM pair if needed
                if amm_pairs.get(stream["to"]) is not None:
                    pair = amm_pairs.get(stream["to"])
                    AMM().recalculate_pair(
                        pair.get("token_0"),
                        pair.get("token_1"),
                        int(data["metadata"]["timestamp"]),
                    )
            else:
                return reject_input(
                    f"Stream with id {stream_id_to_cancel} does not exist",
                    data["payload"],
                )
        else:
            return reject_input(f"Unknown method {payload['method']}", data["payload"])

        notice_str = f"Method {payload['method']} processed from {data['metadata']['msg_sender']} at \
              {data['metadata']['timestamp']} with payload {str_payload}"
        logger.info(f"Adding notice: {notice_str}")
        notice = {"payload": str2hex(notice_str)}
        response = requests.post(rollup_server + "/notice", json=notice)
        logger.info(
            f"Received notice status {response.status_code} body {response.content}"
        )
    except Exception as error:
        restore_storage(amm, balances)
        error_msg = f"Failed to process command '{str_payload}'. {error}"
        return reject_input(error_msg, data["payload"])

    return "accept"


def handle_advance(data):
    logger.info(f"Received advance request data {data}")

    status = "accept"
    try:
        logger.info("Adding notice")
        response = requests.post(
            rollup_server + "/notice", json={"payload": data["payload"]}
        )
        logger.info(
            f"Received notice status {response.status_code} body {response.content}"
        )

        if data["metadata"]["msg_sender"].lower() == erc20Portal["address"].lower():
            status = handle_deposit(data)
        else:
            status = handle_action(data)

    except Exception as e:
        status = "reject"
        msg = f"Error processing data {data}\n{traceback.format_exc()}"
        logger.error(msg)
        response = requests.post(
            rollup_server + "/report", json={"payload": str2hex(msg)}
        )
        logger.info(
            f"Received report status {response.status_code} body {response.content}"
        )

    return status


def handle_inspect(data):
    logger.info(f"Received inspect request data {data}")
    logger.info("Adding report")
    # decode payload as a URL
    url = urlparse(hex2str(data["payload"]))
    amm, balances = get_storage()

    response = None
    try:
        if url.path == "balance":
            # parse query parameters
            query_params = parse_qs(url.query)
            token_address = query_params.get("token", [ZERO_ADDRESS])
            wallet = query_params.get("wallet", [ZERO_ADDRESS])
            timestamp = query_params.get("timestamp", [0])

            if not token_address or not wallet:
                return requests.post(
                    rollup_server + "/report",
                    json={"error": "Missing query parameters"},
                )

            token = StreamableToken(token_address[0])

            response = requests.post(
                rollup_server + "/report",
                json={
                    "payload": str2hex(
                        str(token.balance_of(wallet[0], int(float(timestamp[0]))))
                    )
                },
            )
        if url.path == "balance_details":
            query_params = parse_qs(url.query)
            token_address = query_params.get("token", [ZERO_ADDRESS])
            wallet = query_params.get("wallet", [ZERO_ADDRESS])
            token = StreamableToken(token_address[0])
            token_storage = token.get_storage()
            streams = token_storage["streams"]

            # Convert amounts to strings in the streams
            converted_streams = {
                stream_id: {
                    key: str(value) if key == "amount" else value
                    for key, value in stream.items()
                }
                for stream_id, stream in streams.items()
            }
            balance_details = {
                "balance": str(token_storage["balances"].get(wallet[0], 0)),
                "streams": {
                    stream_id: stream
                    for stream_id, stream in converted_streams.items()
                    if to_checksum_address(stream["from"]) == wallet[0]
                    or to_checksum_address(stream["to"])
                    == to_checksum_address(wallet[0])
                },
            }
            response = requests.post(
                rollup_server + "/report",
                json={"payload": str2hex(json.dumps(balance_details))},
            )
        if url.path == "tokens":
            unique_tokens = set()
            # Iterate through each pair
            for key, pair in amm.get("pairs", {}).items():
                # Add the token addresses to the set
                # unique_tokens.add(key)
                unique_tokens.add(pair["token_0"])
                unique_tokens.add(pair["token_1"])
            for key in balances.keys():
                # Add the token addresses to the set
                unique_tokens.add(key)
            response = requests.post(
                rollup_server + "/report",
                json={"payload": str2hex(json.dumps(list(unique_tokens)))},
            )
        if not response:
            response = requests.post(
                rollup_server + "/report",
                json={"payload": str2hex(f"Unknown path {url.path}")},
            )

        logger.info(f"Received report status {response.status_code}")
    except Exception as e:
        msg = f"Error processing data {data}\n{traceback.format_exc()}"
        logger.error(msg)
        response = requests.post(
            rollup_server + "/report", json={"payload": str2hex(msg)}
        )
        logger.info(
            f"Received report status {response.status_code} body {response.content}"
        )
    return "accept"


handlers = {
    "advance_state": handle_advance,
    "inspect_state": handle_inspect,
}

finish = {"status": "accept"}

while True:
    logger.info("Sending finish")
    response = requests.post(rollup_server + "/finish", json=finish)
    logger.info(f"Received finish status {response.status_code}")
    if response.status_code == 202:
        logger.info("No pending rollup request, trying again")
    else:
        rollup_request = response.json()
        data = rollup_request["data"]

        handler = handlers[rollup_request["request_type"]]
        finish["status"] = handler(rollup_request["data"])
