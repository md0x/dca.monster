import json
import math
import time
import uuid

from eth_utils import to_checksum_address

from ammlibrary import get_pair_address, get_reserves, quote
from constants import ZERO_ADDRESS
from pair import Pair
from streamabletoken import StreamableToken

empty_storage = {'pairs': {}}

MINIMUM_LIQUIDITY = 100000

class AMM():
    """
    AMM
    """

    def __init__(self, address: str):
        self._address =to_checksum_address(address) # layer 1 address
        # create storage file if it doesn't exist
        with open('./storage/amm.json', 'a+') as f:
            f.seek(0)
            if len(f.read(1)) == 0:
                f.write('{}')

    def get_storage(self):
        """
        Get the storage file.
        """
        with open('./storage/amm.json', 'r') as f:
            data = json.load(f)
        return data.get(self._address, empty_storage)
    
    def save_storage(self, storage):
        """
        Save the storage file.
        """
        # Load existing balances
        with open('./storage/amm.json', 'r') as f:
            existing_balances = json.load(f)

        # Save updated balances
        with open('./storage/amm.json', 'w') as f:
            json.dump(existing_balances, f, indent=4)

    def clear_storage(self):
        """
        Clear the storage file for this token only. Useful for testing.
        """
        self.save_storage(empty_storage)


    def _add_liquidity(self, token_a, token_b, token_a_desired, token_b_desired, token_a_min, token_b_min, to, timestamp):

        (reserve_a, reserve_b) = Pair(token_a,token_b).get_reserves(timestamp)

        if reserve_a == 0 and reserve_b == 0:
            amount_a = token_a_desired
            amount_b = token_b_desired
        else:
            amount_b_optimal = quote(token_a_desired, reserve_a, reserve_b)
            if amount_b_optimal <= token_b_desired:
                assert amount_b_optimal >= token_b_min, "UniswapV2Router: INSUFFICIENT_B_AMOUNT"
                amount_a = token_a_desired
                amount_b = amount_b_optimal
            else:
                amount_a_optimal = quote(token_b_desired, reserve_b, reserve_a)
                assert amount_a_optimal <= token_a_desired, "UniswapV2Router: INSUFFICIENT_A_AMOUNT"
                assert amount_a_optimal >= token_a_min, "UniswapV2Router: INSUFFICIENT_A_AMOUNT"
                amount_a = amount_a_optimal
                amount_b = token_b_desired

        return amount_a, amount_b

    def add_liquidity(self,token_a, token_b, token_a_desired, token_b_desired, token_a_min, token_b_min, to, msg_sender, timestamp):
        """
        Add liquidity to a pool
        """
        pair_address = get_pair_address(token_a, token_b)
        (amount_a, amount_b) =self._add_liquidity(token_a, token_b, token_a_desired, token_b_desired, token_a_min, token_b_min, to, timestamp)
        StreamableToken(token_a).transfer_from(msg_sender, pair_address, amount_a)
        StreamableToken(token_b).transfer_from(msg_sender, pair_address, amount_b)
        
        pair = Pair(token_a,token_b)
        total_supply = pair.get_total_supply()
        (reserve_0, reserve_1) = pair.get_reserves()
        if total_supply == 0:
            liquidity = math.floor(math.sqrt(amount_a * amount_b)) - MINIMUM_LIQUIDITY
            pair.mint(MINIMUM_LIQUIDITY, ZERO_ADDRESS)# permanently lock the first MINIMUM_LIQUIDITY tokens
        else:
            liquidity = min(amount_a * total_supply // reserve_0, amount_b * total_supply // reserve_1)
        
        assert liquidity > 0, "UniswapV2Router: INSUFFICIENT_LIQUIDITY_MINTED"
        
        pair.mint(liquidity, to)

        return liquidity
    
    def swap_exact_tokens_for_tokens(self,amount_in,amount_out_min,path,to):
        """
        Swap exact tokens for tokens
        """
        return "TODO"