import copy
import json
import time
import uuid
from pathlib import Path

from eth_utils import to_checksum_address

empty_storage = {"balances": {}, "streams": {}, "totalSupply": 0}


class StreamableToken:
    """
    StreamableToken is a class that represents a token that can be streamed.
    """

    def __init__(self, address: str):
        self._address = to_checksum_address(address)  # layer 1 address
        # create storage folder if it doesn't exist
        Path("./storage").mkdir(parents=True, exist_ok=True)
        # create storage file if it doesn't exist
        with open("./storage/balances.json", "a+") as f:
            f.seek(0)
            if len(f.read(1)) == 0:
                f.write("{}")

    def get_address(self):
        """
        Get the address of the token.
        """
        return self._address

    def get_storage(self):
        """
        Get the storage file.
        """
        with open("./storage/balances.json", "r") as f:
            data = json.load(f)
        return data.get(self._address, copy.deepcopy(empty_storage))

    def save_storage(self, balances):
        """
        Save the storage file.
        """
        # Load existing balances
        with open("./storage/balances.json", "r") as f:
            existing_balances = json.load(f)

        # Update existing balances
        existing_balances[self._address] = balances

        # Save updated balances
        with open("./storage/balances.json", "w") as f:
            json.dump(existing_balances, f, indent=4)

    def clear_storage(self):
        """
        Clear the storage file for this token only. Useful for testing.
        """
        self.save_storage(copy.deepcopy(empty_storage))

    def get_total_supply(self):
        """
        Get the total supply of tokens.
        """
        return int(self.get_storage().get("totalSupply", 0))

    def get_theoric_total_supply(self, timestamp: int = None):
        """
        Get the total supply of tokens. For testing purposes only.
        """
        # Iterate over addresses and sum balance of in max timestamp
        total_supply = 0
        for address in self.get_storage()["balances"]:
            total_supply += self.balance_of(
                address, 2**256 - 1 if timestamp is None else timestamp
            )
        return int(total_supply)

    def mint(self, amount: int, wallet: str):
        """
        Mint a given amount of tokens to a given wallet.
        """
        wallet = to_checksum_address(wallet)

        storage = self.get_storage()

        # If address exists

        # If wallet exists
        if wallet in storage["balances"]:
            # Increment balance
            storage["balances"][wallet] += int(amount)
        else:
            # Add wallet with new balance
            storage["balances"][wallet] = int(amount)
        # Increment total supply
        storage["totalSupply"] += int(amount)

        # Save storage
        self.save_storage(storage)

    def burn(self, amount: int, wallet: str, timestamp: int):
        """
        Burn a given amount of tokens from a given wallet.
        """

        wallet = to_checksum_address(wallet)

        storage = self.get_storage()

        assert timestamp is not None

        self.consolidate_streams(timestamp)

        if self.balance_of(wallet, timestamp) < int(amount):
            raise ValueError("Insufficient balance to burn.")

        # Decrement balance
        storage["balances"][wallet] -= int(amount)

        # Decrement total supply
        storage["totalSupply"] -= int(amount)

        # Save storage
        self.save_storage(storage)

    def balance_of(self, wallet: str, timestamp: int):
        """
        Calculate the balance of a given wallet at a specific timestamp.
        If no timestamp is given, use the current time.
        """
        wallet = to_checksum_address(wallet)

        # Get the balance and streams for this token's address
        storage = self.get_storage()

        # Start with the minted balance
        balance = int(storage["balances"].get(wallet, 0))

        # Prepare keys to search for streams related to the given wallet
        keys = [key for key in storage["streams"].keys() if wallet in key]

        # Iterate over keys related to the given wallet
        for key in keys:
            stream = storage["streams"][key]
            # If the stream has started
            if stream["start"] <= timestamp:
                # Calculate the amount of tokens streamed so far
                elapsed = min(timestamp - stream["start"], stream["duration"])
                streamed = (
                    stream["amount"]
                    if stream["duration"] == 0
                    else int(stream["amount"] * elapsed / stream["duration"])
                )

                # If the stream is to the given wallet, add the streamed tokens to the balance
                if stream["to"] == wallet:
                    balance += streamed

                # If the stream is from the given wallet, subtract the streamed tokens from the balance
                if stream["from"] == wallet:
                    balance -= streamed

        return balance

    def transfer_from(
        self,
        sender: str,
        receiver: str,
        amount: int,
        duration: int,
        start: int,
        timestamp: int,
        dir: "list[str]" = [],
        parent_id: str = "",
    ):
        """
        Create a new stream transferring a given amount of tokens from the sender to the receiver
        over a given duration. The transfer starts at the given start time, or the current time
        if no start time is given.
        """
        sender = to_checksum_address(sender)
        receiver = to_checksum_address(receiver)

        # Use the current time if no timestamp is 0
        if start == 0:
            start = timestamp
        assert start >= timestamp, "Start time must be greater than current time."

        # Get the balance and streams for this token's address
        storage = self.get_storage()

        # Check that the sender has enough balance at the start time to initiate the stream
        if self.balance_of(sender, start) < int(amount):
            raise ValueError("Insufficient balance to initiate the stream.")

        # Init balance of receiver if not exists.
        if receiver not in storage["balances"]:
            storage["balances"][receiver] = 0

        # Create a new stream
        stream_id = f"{sender}-{receiver}-{str(uuid.uuid4())}"
        storage["streams"][stream_id] = {
            "from": sender,
            "to": receiver,
            "amount": int(amount),
            "start": start,
            "duration": int(duration),
            "dir": dir,
            "parent_id": parent_id,
        }

        self.save_storage(storage)

    def consolidate_streams(self, until_timestamp):
        """
        Accrue all the sent and received tokens from streams until a specific timestamp.
        """

        # Get the balance and streams for this token's address
        storage = self.get_storage()

        # List to store streams to delete after processing
        streams_to_delete = []

        # Iterate over streams
        for stream_id, stream in storage["streams"].items():
            # If the stream has started
            if stream["start"] <= until_timestamp:
                # Calculate the elapsed time and the amount of tokens to stream
                elapsed = min(until_timestamp - stream["start"], stream["duration"])
                to_stream = (
                    stream["amount"]
                    if stream["duration"] == 0
                    else int(stream["amount"] * elapsed / stream["duration"])
                )

                # Update the sender's balance
                if stream["from"] in storage["balances"]:
                    storage["balances"][stream["from"]] -= to_stream

                # Update the receiver's balance
                if stream["to"] in storage["balances"]:
                    storage["balances"][stream["to"]] += to_stream

                # Update the stream amount
                stream["amount"] -= to_stream

                # Update the stream start time
                stream["start"] += elapsed

                # Update the stream duration
                stream["duration"] -= elapsed

                # Check if the stream is finished
                if stream["amount"] == 0 or stream["duration"] == 0:
                    streams_to_delete.append(stream_id)

        # Delete finished streams
        for stream_id in streams_to_delete:
            del storage["streams"][stream_id]

        self.save_storage(storage)

    def cancel_stream(self, stream_id: str, sender: str, timestamp):
        """
        Allow a sender to cancel a specific stream.
        """
        sender = to_checksum_address(sender)

        # Accrue the balances up to the current time to account for the canceled stream
        # If the stream is not found, the balances will be accrued up to the current time
        self.consolidate_streams(timestamp)

        # Load existing balances
        storage = self.get_storage()

        # Check if the stream exists
        assert stream_id in storage["streams"], "Stream not found."

        # Check if the user is the sender
        assert (
            storage["streams"][stream_id]["from"] == sender
        ), "Only the sender can cancel the stream."

        del storage["streams"][stream_id]

        # Write the updated data back to the file
        self.save_storage(storage)

    def get_stream_points(self, streams):
        points = set()
        for stream in streams.values():
            if stream["duration"] == 0:
                continue
            points.add(stream["start"])
            points.add(stream["start"] + stream["duration"])
        return sorted(list(points))

    def normalize_streams(self, manual_points=None):
        storage = self.get_storage()

        streams = storage["streams"]

        if manual_points is None:
            points = self.get_stream_points(streams)
        else:
            # Use provided points
            points = sorted(manual_points)

        # Create intervals
        intervals = [(points[i], points[i + 1]) for i in range(len(points) - 1)]

        # Create new streams based on these intervals
        new_streams = {}
        for interval in intervals:
            start, end = interval
            for stream_id, stream in streams.items():
                if (
                    stream["start"] <= start < stream["start"] + stream["duration"]
                ) or (stream["start"] < end <= stream["start"] + stream["duration"]):
                    # Stream overlaps with interval, split it
                    duration = end - start
                    amount = (stream["amount"] / stream["duration"]) * duration
                    new_stream_id = (
                        f"{stream['from']}-{stream['to']}-{str(uuid.uuid4())}"
                    )
                    parent_id = stream.get("parent_id", "")
                    new_streams[new_stream_id] = {
                        "from": stream["from"],
                        "to": stream["to"],
                        "amount": int(amount),
                        "start": int(start),
                        "duration": int(duration),
                        "dir": stream["dir"],
                        "parent_id": parent_id if parent_id != "" else stream_id,
                    }

        # save new streams
        storage["streams"] = new_streams

        self.save_storage(storage)
