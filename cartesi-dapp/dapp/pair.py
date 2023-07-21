from ammlibrary import get_pair_address, sort_tokens
from streamabletoken import StreamableToken


class Pair(StreamableToken):
    def __init__(self, _token0, _token1):
        super().__init__(get_pair_address(token0, token1))
        (token0, token1) = sort_tokens(_token0, _token1)
        self.token0 = token0
        self.token1 = token1

    def get_reserves(self, timestamp):
        return (
            StreamableToken(self.token0).balance_of(self.token0, timestamp),
            StreamableToken(self.token1).balance_of(self.token1, timestamp),
        )
