import hashlib

from dapp.streamabletoken import StreamableToken
from eth_utils import to_checksum_address


def addresses_to_hex(address1, address2):
    concatenated_addresses = address1 + address2
    sha256_hash = hashlib.sha256(concatenated_addresses.encode()).digest()
    ethereum_address = "0x" + sha256_hash[-20:].hex()
    return ethereum_address


def sort_tokens(token0, token1):
    return (token0, token1) if token0 < token1 else (token1, token0)


def get_pair_address(token0, token1):
    sorted_tokens = sort_tokens(token0, token1)
    return to_checksum_address(addresses_to_hex(sorted_tokens[0], sorted_tokens[1]))


def quote(amount_a, reserve_a, reserve_b):
    assert amount_a > 0, "AmmLibrary: INSUFFICIENT_AMOUNT"
    assert reserve_a > 0 and reserve_b > 0, "AmmLibrary: INSUFFICIENT_LIQUIDITY"

    return (amount_a * reserve_b) // reserve_a
