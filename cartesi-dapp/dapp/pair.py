from dapp.ammlibrary import get_pair_address, sort_tokens
from dapp.streamabletoken import StreamableToken
from eth_utils import to_checksum_address


class Pair(StreamableToken):
    def __init__(self, _token0, _token1):
        _token0, _token1 = to_checksum_address(_token0), to_checksum_address(_token1)
        super().__init__(get_pair_address(_token0, _token1))
        (token0, token1) = sort_tokens(_token0, _token1)
        self.token0 = token0
        self.token1 = token1

    def get_reserves(self, timestamp):
        return (
            StreamableToken(self.token0).balance_of(super().get_address(), timestamp),
            StreamableToken(self.token1).balance_of(super().get_address(), timestamp),
        )

    def get_tokens(self):
        return (self.token0, self.token1)
