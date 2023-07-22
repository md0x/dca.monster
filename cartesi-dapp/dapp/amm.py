import json
import math
import time
import uuid

from dapp.ammlibrary import get_amount_out, quote
from dapp.constants import ZERO_ADDRESS
from dapp.pair import Pair
from dapp.streamabletoken import StreamableToken

empty_storage = {"pairs": {}}

MINIMUM_LIQUIDITY = 100000


class AMM:
    """
    AMM
    """

    def __init__(self):
        # create storage file if it doesn't exist
        with open("./storage/amm.json", "a+") as f:
            f.seek(0)
            if len(f.read(1)) == 0:
                f.write("{}")

    def get_storage(self):
        """
        Get the storage file.
        """
        with open("./storage/amm.json", "r") as f:
            data = json.load(f)
        return data.get(self._address, empty_storage)

    def save_storage(self, storage):
        """
        Save the storage file.
        """
        # Load existing balances
        with open("./storage/amm.json", "r") as f:
            existing_balances = json.load(f)

        # Save updated balances
        with open("./storage/amm.json", "w") as f:
            json.dump(existing_balances, f, indent=4)

    def clear_storage(self):
        """
        Clear the storage file for this token only. Useful for testing.
        """
        self.save_storage(empty_storage)

    def get_reserves(self, token_a, token_b, timestamp):
        """
        Get the reserves of a pair at a given timestamp.
        """
        pair = Pair(token_a, token_b)
        (reserve_0, reserve_1) = pair.get_reserves(timestamp)
        return (
            (reserve_0, reserve_1)
            if token_a == pair.get_tokens()[0]
            else (reserve_1, reserve_0)
        )

    def _add_liquidity(
        self,
        token_a,
        token_b,
        token_a_desired,
        token_b_desired,
        token_a_min,
        token_b_min,
        to,
        timestamp,
    ):
        (reserve_a, reserve_b) = self.get_reserves(token_a, token_b, timestamp)

        if reserve_a == 0 and reserve_b == 0:
            amount_a = int(token_a_desired)
            amount_b = int(token_b_desired)
        else:
            amount_b_optimal = quote(token_a_desired, reserve_a, reserve_b)
            if amount_b_optimal <= token_b_desired:
                assert amount_b_optimal >= token_b_min, "AMM: INSUFFICIENT_B_AMOUNT"
                amount_a = int(token_a_desired)
                amount_b = int(amount_b_optimal)
            else:
                amount_a_optimal = quote(token_b_desired, reserve_b, reserve_a)
                assert amount_a_optimal <= token_a_desired, "AMM: INSUFFICIENT_A_AMOUNT"
                assert amount_a_optimal >= token_a_min, "AMM: INSUFFICIENT_A_AMOUNT"
                amount_a = int(amount_a_optimal)
                amount_b = int(token_b_desired)

        return amount_a, amount_b

    def add_liquidity(
        self,
        token_a,
        token_b,
        token_a_desired,
        token_b_desired,
        token_a_min,
        token_b_min,
        to,
        msg_sender,
        timestamp,
    ):
        """
        Add liquidity to a pool
        """
        pair = Pair(token_a, token_b)
        pair_address = pair.get_address()
        (reserve_a, reserve_b) = self.get_reserves(token_a, token_b, timestamp)

        (amount_a, amount_b) = self._add_liquidity(
            token_a,
            token_b,
            token_a_desired,
            token_b_desired,
            token_a_min,
            token_b_min,
            to,
            timestamp,
        )

        StreamableToken(token_a).transfer_from(
            msg_sender, pair_address, amount_a, 0, timestamp
        )
        StreamableToken(token_b).transfer_from(
            msg_sender, pair_address, amount_b, 0, timestamp
        )

        total_supply = pair.get_total_supply()

        if total_supply == 0:
            liquidity = math.floor(math.sqrt(amount_a * amount_b)) - MINIMUM_LIQUIDITY
            pair.mint(
                MINIMUM_LIQUIDITY, ZERO_ADDRESS
            )  # permanently lock the first MINIMUM_LIQUIDITY tokens
        else:
            liquidity = min(
                amount_a * total_supply // reserve_a,
                amount_b * total_supply // reserve_b,
            )

        assert liquidity > 0, "AMM: INSUFFICIENT_LIQUIDITY_MINTED"

        pair.mint(liquidity, to)

        return liquidity

    def remove_liquidity(
        self,
        token_a,
        token_b,
        liquidity,
        amount_a_min,
        amount_b_min,
        to,
        msg_sender,
        timestamp,
    ):
        """
        Remove liquidity from a pool
        """
        pair = Pair(token_a, token_b)
        pair_address = pair.get_address()
        pair.transfer_from(msg_sender, pair_address, liquidity, 0, timestamp)

        (reserve_0, reserve_1) = pair.get_reserves(timestamp)
        (token_0, token_1) = pair.get_tokens()

        total_supply = pair.get_total_supply()

        amount_0 = liquidity * reserve_0 // total_supply
        amount_1 = liquidity * reserve_1 // total_supply

        assert amount_0 >= 0, "AMM: INSUFFICIENT_LIQUIDITY_BURNED"
        assert amount_1 >= 0, "AMM: INSUFFICIENT_LIQUIDITY_BURNED"

        pair.burn(liquidity, pair_address, timestamp)

        StreamableToken(token_0).transfer_from(pair_address, to, amount_0, 0, timestamp)
        StreamableToken(token_1).transfer_from(pair_address, to, amount_1, 0, timestamp)

        (amount_a, amount_b) = (
            (amount_0, amount_1) if token_0 == token_a else (amount_1, amount_0)
        )

        assert amount_a >= amount_a_min, "AMM: INSUFFICIENT_A_AMOUNT"
        assert amount_b >= amount_b_min, "AMM: INSUFFICIENT_B_AMOUNT"

        return amount_0, amount_1

    def swap_exact_tokens_for_tokens(
        self,
        amount_in,
        amount_out_min,
        path,
        start,
        duration,
        to,
        msg_sender,
        timestamp,
    ):
        """
        Swap exact tokens for tokens
        """
        assert len(path) == 2, "AMM: INVALID_PATH"
        assert start >= timestamp, "AMM: INVALID_START_TIME"

        pair = Pair(path[0], path[1])

        token_0 = StreamableToken(path[0])
        token_1 = StreamableToken(path[1])

        token_0.consolidate_streams(timestamp)
        token_1.consolidate_streams(timestamp)

        if duration == 0:
            (reserve_in, reserve_out) = self.get_reserves(path[0], path[1], start)
            amount_out = get_amount_out(amount_in, reserve_in, reserve_out)
            assert amount_out >= amount_out_min, "AMM: INSUFFICIENT_OUTPUT_AMOUNT"
            k_before = reserve_in * reserve_out
            k_after = (reserve_in + amount_in) * (reserve_out - amount_out)
            assert k_after >= k_before, "AMM: K"
            token_0.transfer_from(
                msg_sender, pair.get_address(), amount_in, 0, timestamp
            )
            token_1.transfer_from(pair.get_address(), to, amount_out, 0, timestamp)
            (reserve_in, reserve_out) = self.get_reserves(path[0], path[1], start)
            print("reserve_in", reserve_in)
        else:
            token_0.transfer_from(
                msg_sender,
                pair.get_address(),
                amount_in,
                int(duration),
                int(start),
                [msg_sender, to],
            )

        token_0.consolidate_streams(timestamp)
        token_1.consolidate_streams(timestamp)

        # Delete existing streams from pair to users for token_0
        existing_storage_0 = token_0.get_storage()
        existing_streams_0 = existing_storage_0["streams"]
        existing_storage_0["streams"] = {
            stream_id: stream
            for stream_id, stream in existing_streams_0.items()
            if stream["from"] != pair.get_address()
        }
        token_0.save_storage(existing_storage_0)

        # Delete existing streams from pair to users for token_1
        existing_storage_1 = token_1.get_storage()
        existing_streams_1 = existing_storage_1["streams"]
        existing_storage_1["streams"] = {
            stream_id: stream
            for stream_id, stream in existing_streams_1.items()
            if stream["from"] != pair.get_address()
        }
        token_1.save_storage(existing_storage_1)

        # Prepare streams
        points = set()
        token_0_stream_points = token_0.get_stream_points(
            token_0.get_storage()["streams"]
        )
        token_1_stream_points = token_1.get_stream_points(
            token_1.get_storage()["streams"]
        )

        for point in token_0_stream_points:
            points.add(point)
        for point in token_1_stream_points:
            points.add(point)

        points = sorted(list(points))

        # Split streams
        token_0.normalize_streams(points)
        token_1.normalize_streams(points)

        intervals = [(points[i], points[i + 1]) for i in range(len(points) - 1)]

        # Get streams flowing to the pair within each interval for token 0
        token_0_streams_within_intervals = {}
        token_1_streams_within_intervals = {}
        for interval in intervals:
            start_time, end_time = interval
            streams_within_interval_token_0 = []
            for stream_id, stream in token_0.get_storage()["streams"].items():
                if (
                    stream["to"] == pair.get_address()
                    and stream["start"] == start_time
                    and end_time == stream["start"] + stream["duration"]
                    and len(stream["dir"]) == 2
                ):
                    streams_within_interval_token_0.append(stream)
            token_0_streams_within_intervals[interval] = streams_within_interval_token_0

            streams_within_interval_token_1 = []
            for stream_id, stream in token_1.get_storage()["streams"].items():
                if (
                    stream["to"] == pair.get_address()
                    and stream["start"] == start_time
                    and end_time == stream["start"] + stream["duration"]
                    and len(stream["dir"]) == 2
                ):
                    streams_within_interval_token_1.append(stream)
            token_1_streams_within_intervals[interval] = streams_within_interval_token_1

        for interval in intervals:
            token_0_streams_within_interval = token_0_streams_within_intervals[interval]
            token_1_streams_within_interval = token_1_streams_within_intervals[interval]

            token_0_sum = sum(
                stream["amount"] for stream in token_0_streams_within_interval
            )
            token_1_sum = sum(
                stream["amount"] for stream in token_1_streams_within_interval
            )
            # Get reserves at start of interval
            (reserve_in, reserve_out) = self.get_reserves(path[0], path[1], interval[0])
            amount_out_token_1 = (
                get_amount_out(token_0_sum, reserve_in, reserve_out)
                if token_0_sum != 0
                else 0
            )
            amount_out_token_0 = (
                get_amount_out(token_1_sum, reserve_out, reserve_in)
                if token_1_sum != 0
                else 0
            )

            # Check k
            k_before = reserve_in * reserve_out
            k_after = (reserve_in + token_0_sum - amount_out_token_0) * (
                reserve_out + token_1_sum - amount_out_token_1
            )
            assert k_after >= k_before, "AMM: K"

            # iterate through streams in token_0_streams_within_interval
            for stream in token_0_streams_within_interval:
                token_1.transfer_from(
                    pair.get_address(),
                    stream["dir"][1],
                    int(amount_out_token_1 * stream["amount"] // token_0_sum),
                    stream["duration"],
                    interval[0],
                    stream["dir"],
                )

            # iterate through streams in token_1_streams_within_interval
            for stream in token_1_streams_within_interval:
                token_0.transfer_from(
                    pair.get_address(),
                    stream["dir"][1],
                    int(amount_out_token_0 * stream["amount"] // token_1_sum),
                    stream["duration"],
                    interval[0],
                    stream["dir"],
                )

        return "ok"
