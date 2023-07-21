import json
import time

class StreamableToken():
    """
    StreamableToken is a class that represents a token that can be streamed.
    """

    def __init__(self, address: str):
        self._address = address # layer 1 address

    def mint(self, wallet: str, amount: int):
        """
        Mint a given amount of tokens to a given wallet.
        """

        # Load existing balances
        with open('./storage/balances.json', 'r') as f:
            balances = json.load(f)

        # If address exists
        if self._address in balances:
            # If wallet exists
            if wallet in balances[self._address]['balances']:
                # Increment balance
                balances[self._address]['balances'][wallet] += amount
            else:
                # Add wallet with new balance
                balances[self._address]['balances'][wallet] = amount
        else:
            # Add address and wallet with new balance
            balances[self._address] = {
                'balances': {wallet: amount},
                'streams': {}
            }

        # Write updated balances
        with open('./storage/balances.json', 'w') as f:
            json.dump(balances, f, indent=4)

    def balance_of(self, wallet: str, timestamp: int = None):
        """
        Calculate the balance of a given wallet at a specific timestamp.
        If no timestamp is given, use the current time.
        """

        # Use the current time if no timestamp is given
        if timestamp is None:
            timestamp = int(time.time())

        # Load existing balances
        with open('./storage/balances.json', 'r') as f:
            data = json.load(f)

        # Get the balance and streams for this token's address
        token_data = data.get(self._address, {'balances': {}, 'streams': {}})

        # Start with the minted balance
        balance = token_data['balances'].get(wallet, 0)

        # Prepare keys to search for streams related to the given wallet
        keys = [key for key in token_data['streams'].keys() if wallet in key]

        # Iterate over keys related to the given wallet
        for key in keys:
            stream = token_data['streams'][key]
            # If the stream has started but not ended
            if stream['start'] <= timestamp < stream['start'] + stream['duration']:
                # Calculate the amount of tokens streamed so far
                elapsed = timestamp - stream['start']
                streamed = stream['amount'] * elapsed / stream['duration']

                # If the stream is to the given wallet, add the streamed tokens to the balance
                if stream['to'] == wallet:
                    balance += streamed

                # If the stream is from the given wallet, subtract the streamed tokens from the balance
                if stream['from'] == wallet:
                    balance -= streamed

        return balance
    