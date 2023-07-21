import json
import time

from eth_utils import to_checksum_address


class StreamableToken:
    """
    StreamableToken is a class that represents a token that can be streamed.
    """

    def __init__(self, address: str):
        self._address = to_checksum_address(address)  # layer 1 address

    def mint(self, wallet: str, amount: int):
        """
        Mint a given amount of tokens to a given wallet.
        """
        wallet = to_checksum_address(wallet)

        # Load existing balances
        with open("./storage/balances.json", "r") as f:
            balances = json.load(f)

        # If address exists
        if self._address in balances:
            # If wallet exists
            if wallet in balances[self._address]["balances"]:
                # Increment balance
                balances[self._address]["balances"][wallet] += amount
            else:
                # Add wallet with new balance
                balances[self._address]["balances"][wallet] = amount
        else:
            # Add address and wallet with new balance
            balances[self._address] = {"balances": {wallet: amount}, "streams": {}}

        # Write updated balances
        with open("./storage/balances.json", "w") as f:
            json.dump(balances, f, indent=4)

    def balance_of(self, wallet: str, timestamp: int = None):
        """
        Calculate the balance of a given wallet at a specific timestamp.
        If no timestamp is given, use the current time.
        """
        wallet = to_checksum_address(wallet)

        # Use the current time if no timestamp is given
        if timestamp is None:
            timestamp = int(time.time())

        # Load existing balances
        with open("./storage/balances.json", "r") as f:
            data = json.load(f)

        # Get the balance and streams for this token's address
        token_data = data.get(self._address, {"balances": {}, "streams": {}})

        # Start with the minted balance
        balance = token_data["balances"].get(wallet, 0)

        # Prepare keys to search for streams related to the given wallet
        keys = [key for key in token_data["streams"].keys() if wallet in key]

        # Iterate over keys related to the given wallet
        for key in keys:
            stream = token_data["streams"][key]
            # If the stream has started
            if stream["start"] <= timestamp:
                # Calculate the amount of tokens streamed so far
                elapsed = min(timestamp - stream["start"], stream["duration"])
                streamed = stream["amount"] * elapsed / stream["duration"]

                # If the stream is to the given wallet, add the streamed tokens to the balance
                if stream["to"] == wallet:
                    balance += streamed

                # If the stream is from the given wallet, subtract the streamed tokens from the balance
                if stream["from"] == wallet:
                    balance -= streamed

        return balance

    def transfer_from(
        self, sender: str, receiver: str, amount: int, duration: int, start: int = None
    ):
        """
        Create a new stream transferring a given amount of tokens from the sender to the receiver
        over a given duration. The transfer starts at the given start time, or the current time
        if no start time is given.
        """
        sender = to_checksum_address(sender)
        receiver = to_checksum_address(receiver)

        # Use the current time if no start time is given
        if start is None:
            start = int(time.time())

        # Load existing balances
        with open("./storage/balances.json", "r") as f:
            data = json.load(f)

        # Get the balance and streams for this token's address
        token_data = data.get(self._address, {"balances": {}, "streams": {}})

        # Check that the sender has enough balance at the start time to initiate the stream
        if self.balance_of(sender, start) < amount:
            raise ValueError("Insufficient balance to initiate the stream.")

        # Create a new stream
        stream_id = f"{sender}-{receiver}"
        token_data["streams"][stream_id] = {
            "from": sender,
            "to": receiver,
            "amount": amount,
            "start": start,
            "duration": duration,
        }

        # Update the balances and streams
        data[self._address] = token_data

        # Write the updated data back to the file
        with open("./storage/balances.json", "w") as f:
            json.dump(data, f, indent=4)

    def accrue(self, until_timestamp: int = None):
        """
        Accrue all the sent and received tokens from streams until a specific timestamp.
        """

        # Use the current time if no timestamp is given
        if until_timestamp is None:
            until_timestamp = int(time.time())

        # Load existing balances
        with open("./storage/balances.json", "r") as f:
            data = json.load(f)

        # Get the balance and streams for this token's address
        token_data = data.get(self._address, {"balances": {}, "streams": {}})

        # List to store streams to delete after processing
        streams_to_delete = []

        # Iterate over streams
        for stream_id, stream in token_data["streams"].items():
            # If the stream has started
            if stream["start"] <= until_timestamp:
                # Calculate the elapsed time and the amount of tokens to stream
                elapsed = min(until_timestamp - stream["start"], stream["duration"])
                to_stream = stream["amount"] * elapsed / stream["duration"]

                # Update the sender's balance
                if stream["from"] in token_data["balances"]:
                    token_data["balances"][stream["from"]] -= to_stream

                # Update the receiver's balance
                if stream["to"] in token_data["balances"]:
                    token_data["balances"][stream["to"]] += to_stream

                # Update the stream amount
                stream["amount"] -= to_stream

                # Check if the stream is finished
                if stream["amount"] <= 0 or elapsed == stream["duration"]:
                    streams_to_delete.append(stream_id)

        # Delete finished streams
        for stream_id in streams_to_delete:
            del token_data["streams"][stream_id]

        # Update the balances and streams
        data[self._address] = token_data

        # Write the updated data back to the file
        with open("./storage/balances.json", "w") as f:
            json.dump(data, f, indent=4)

    def cancel_stream(self, stream_id: str, sender: str):
        """
        Allow a sender to cancel a specific stream.
        """
        sender = to_checksum_address(sender)

        # Accrue the balances up to the current time to account for the canceled stream
        # If the stream is not found, the balances will be accrued up to the current time
        self.accrue()

        # Load existing balances
        with open("./storage/balances.json", "r") as f:
            data = json.load(f)

        # Get the balance and streams for this token's address
        token_data = data.get(self._address, {"balances": {}, "streams": {}})

        # Check if the stream exists
        if stream_id in token_data["streams"]:
            # Check if the user is the sender
            if token_data["streams"][stream_id]["from"] == sender:
                # Remove the stream
                del token_data["streams"][stream_id]
            else:
                print("Only the sender can cancel the stream.")
        else:
            print("Stream not found.")

        # Write the updated data back to the file
        with open("./storage/balances.json", "w") as f:
            json.dump(data, f, indent=4)
