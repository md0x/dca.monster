import unittest
from unittest.mock import MagicMock, patch

from dapp.amm import AMM, MINIMUM_LIQUIDITY
from dapp.pair import Pair
from dapp.streamabletoken import StreamableToken


class TestAmm(unittest.TestCase):
    def setUp(self):
        self.token_one_address = "0x1234567890ABCDEF1234567890ABCDEF12345678"
        self.token_two_address = "0x1234567890ABCDEF1234567890ABCDEF12345679"
        self.sender_address = "0x1234567890ABCDEF1234567890ABCDEF12345672"
        self.receiver_address = "0xabCDEF1234567890ABcDEF1234567890aBCDeF12"
        self.random_address = "0x1234567890ABCDEF1234567890ABCDEF12345670"

        self.token_one = StreamableToken(self.token_one_address)
        self.token_two = StreamableToken(self.token_two_address)
        self.pair = Pair(self.token_one_address, self.token_two_address)

        self.token_one.clear_storage()
        self.token_two.clear_storage()
        self.pair.clear_storage()

        self.amm = AMM()

    def tearDown(self):
        # Cleanup code that runs after each test case
        self.assertTrue(
            abs(
                self.token_one.get_total_supply()
                - self.token_one.get_theoric_total_supply()
            )
            < 10
        )
        self.assertTrue(
            abs(
                self.token_two.get_total_supply()
                - self.token_two.get_theoric_total_supply()
            )
            < 10
        )
        self.assertTrue(
            abs(self.pair.get_total_supply() - self.pair.get_theoric_total_supply())
            < 10
        )
        self.token_one.consolidate_streams()
        self.token_two.consolidate_streams()
        self.pair.consolidate_streams()
        self.token_one.clear_storage()
        self.token_two.clear_storage()
        self.pair.clear_storage()

    def test_swap(self):
        amount = 100 * 10**18
        timestamp = 0

        self.token_one.mint(amount, self.sender_address)
        self.token_two.mint(amount, self.sender_address)

        self.amm.add_liquidity(
            self.token_one_address,
            self.token_two_address,
            amount,
            amount // 3,
            0,
            0,
            self.sender_address,
            self.sender_address,
            timestamp,
        )

        self.token_one.mint(10**18, self.receiver_address)

        self.amm.swap_exact_tokens_for_tokens(
            10**18,
            0,
            [self.token_one_address, self.token_two_address],
            0,
            10,
            self.receiver_address,
            self.receiver_address,
            0,
        )

        print(self.token_two.balance_of(self.receiver_address, 0))
        print(self.token_two.balance_of(self.receiver_address, 5))
        print(self.token_two.balance_of(self.receiver_address, 10))

        # Timestamp 4
        timestamp = 4

        self.token_two.mint(100 * 10**18, self.random_address)

        self.amm.swap_exact_tokens_for_tokens(
            50 * 10**18,
            0,
            [self.token_two_address, self.token_one_address],
            timestamp,
            1,
            self.random_address,
            self.random_address,
            timestamp,
        )

        print(self.token_two.balance_of(self.receiver_address, timestamp))
        print(self.token_two.balance_of(self.receiver_address, 5))
        print(self.token_two.balance_of(self.receiver_address, 10))


if __name__ == "__main__":
    unittest.main()
