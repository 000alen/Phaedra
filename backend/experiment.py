
import Phaedra.Secrets
import Phaedra.Language

secrets = Phaedra.Secrets.get_secrets()
Phaedra.Secrets.load_secrets(secrets)

text = """Bitcoin (₿) is a decentralized digital currency, without a central bank or single administrator, that can be sent from user to user on the peer-to-peer bitcoin network without the need for intermediaries.[8] Transactions are verified by network nodes through cryptography and recorded in a public distributed ledger called a blockchain. The cryptocurrency was invented in 2008 by an unknown person or group of people using the name Satoshi Nakamoto.[10] The currency began use in 2009[11] when its implementation was released as open-source software."""

summary = Phaedra.Language.summarize_openai(text)

print(summary)
