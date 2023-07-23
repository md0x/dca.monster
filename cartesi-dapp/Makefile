test:
	python -m unittest discover -s tests
build:
	docker buildx bake -f docker-bake.hcl -f docker-bake.override.hcl --load
dev:
	docker compose up
dev-down:
	docker compose down -v
host:
	docker compose -f docker-compose.yml -f docker-compose.override.yml -f docker-compose-host.yml up
host-python:
	ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004" python3 -m dapp.dca
hash:
	docker buildx bake -f docker-bake.hcl -f docker-bake.override.hcl machine --load
deploy-gnosis-chiado:
	MNEMONIC="trap basket portion ride cheap uncle benefit keen quantum smoke burden turtle" \
	NETWORK=gnosis_chiado \
	RPC_URL=https://rpc.chiadochain.net \
	DAPP_NAME=dca.monster docker compose -f ./deploy-testnet.yml up
run-chidao:
	RPC_URL=https://rpc.chiado.gnosis.gateway.fm \
	WSS_URL=wss://gnosis-chiado.blastapi.io/ad45cbd2-f720-4c51-8bae-a0b73215f36d \
	NETWORK=chiado \
	BLOCK_CONFIRMATIONS=1 \
	BLOCK_CONFIRMATIONS_TX=2 \
	CHAIN_ID=80001 \
	MNEMONIC="trap basket portion ride cheap uncle benefit keen quantum smoke burden turtle" \
	DAPP_NAME=dca.monster docker compose -f ./docker-compose-testnet.yml -f ./docker-compose.override.yml up
fund-alice:
	cast send 0x278639F7912F119EE7DF93Fb12A3aD3148987ce3 --value 10ether --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
fund-bob:
	cast send 0x81dFc0D7CaAEADD1776C97BEa76994BA329D4627 --value 10ether --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
add-liquidity:
	export DAPP_ADDRESS=$(cat deployments/localhost/dapp.json | jq -r '.address')
	export INPUT_BOX_ADDRESS=$(cat deployments/localhost/InputBox.json | jq -r '.address')
	export ERC20_PORTAL_ADDRESS=$(cat deployments/localhost/ERC20Portal.json | jq -r '.address')
	export ERC20_ADDRESS=$$ERC20_ADDRESS
	export ERC20_ADDRESS_2=$$ERC20_ADDRESS_2
	export SIGNER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
	export PRIVATE_KEY=$$PRIVATE_KEY
	export RPC_URL=http://127.0.0.1:8545/ 
	export AMOUNT=40000000000000000000000
	export DURATION=3600
	cast send $$INPUT_BOX_ADDRESS \
			"addInput(address,bytes)" \
			$$DAPP_ADDRESS \
					$(cast --from-utf8 "{\"method\":\"add_liquidity\",\"args\":{\"token_a\":\"$ERC20_ADDRESS\",\"token_b\":\"$ERC20_ADDRESS_2\",\"token_a_desired\":$AMOUNT,\"token_b_desired\":$AMOUNT,\"token_a_min\":0,\"token_b_min\":0,\"to\":\"$SIGNER_ADDRESS\"}}"
		) \
			--from $$SIGNER_ADDRESS \
			--private-key $$PRIVATE_KEY \
			--rpc-url $$RPC_URL