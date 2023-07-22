import unittest
from unittest.mock import MagicMock, patch

from dapp.streamabletoken import StreamableToken


class TestStreamableToken(unittest.TestCase):
    def setUp(self):
        self.token_address = "0x1234567890ABCDEF1234567890ABCDEF12345678"
        self.sender_address = "0x1234567890ABCDEF1234567890ABCDEF12345672"
        self.receiver_address = "0xabCDEF1234567890ABcDEF1234567890aBCDeF12"
        self.random_address = "0x1234567890ABCDEF1234567890ABCDEF12345670"
        self.random_address_2 = "0x1234567890ABCDEF1234567890ABCDEF12345671"

        self.token = StreamableToken(self.token_address)
        self.token.clear_storage()

    def test_transfer_from(self):
        token = StreamableToken(self.token_address)
        token.clear_storage()

        self.assertEqual(token.get_total_supply(), token.get_theoric_total_supply())
        token.mint(100, self.sender_address)
        start_time = 0
        duration = 1000
        amount = 10

        # Transfer tokens in stream
        token.transfer_from(
            self.sender_address, self.receiver_address, amount, duration, start_time
        )

        # Balance should be 0 initially
        self.assertEqual(token.balance_of(self.receiver_address, start_time), 0)

        # Balance should be half after half the duration
        self.assertEqual(
            token.balance_of(self.receiver_address, start_time + duration / 2),
            amount / 2,
        )

        # Balance should be full after the duration
        self.assertEqual(
            token.balance_of(self.receiver_address, start_time + duration), amount
        )

        # Total supply minted should be equal to the actual brute force calculation
        self.assertEqual(token.get_total_supply(), token.get_theoric_total_supply())

        # Consolidate the stream
        token.consolidate_streams(2**256 - 1)
        self.assertEqual(token.get_total_supply(), token.get_theoric_total_supply())

        # Insta transfer
        initial_balance = token.balance_of(self.receiver_address, start_time)
        token.transfer_from(
            self.sender_address, self.receiver_address, amount, 0, start_time
        )
        self.assertEqual(
            token.balance_of(self.receiver_address, start_time),
            initial_balance + amount,
        )
        self.assertEqual(token.get_total_supply(), token.get_theoric_total_supply())

    def test_split_intervals(self):
        self.token.mint(10 * 10**18, self.sender_address)

        self.token.transfer_from(
            self.sender_address, self.receiver_address, 1 * 10**18, 100, 0
        )

        self.token.transfer_from(
            self.sender_address, self.random_address, 1 * 10**18, 100, 10
        )

        self.token.transfer_from(
            self.sender_address, self.random_address_2, 1 * 10**18, 100, 20
        )

        self.token.transfer_from(
            self.sender_address, self.random_address_2, 1 * 10**18, 0, 50
        )

        self.token.normalize_streams()

        self.assertEqual(
            self.token.get_total_supply(), self.token.get_theoric_total_supply()
        )

        self.token.normalize_streams()


if __name__ == "__main__":
    unittest.main()
