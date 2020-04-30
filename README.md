Deniable group Messager
=======

OTR style encryption for group chat.

A work in progress. Not yet usable.

built for https://github.com/zack-bitcoin/amoveo

Goal
========

With normal encryption, every message you send is also a cryptographic proof that you wrote that message.
This means encrypted communication can often be more dangerous than non-encrypted.

The property we want is "deniability".
After a message is delivered, we want it to be impossible for anyone to prove that you wrote it.

But at the same time, we also want the recipient to know who sent the message.

And finally, we want to efficiently do this kind of communication with large groups of people. at least thousands.

OTR method
=========

Sender starts with a veo pub/priv pair: Spub, Spriv.

Receiver starts with a veo pub/priv pair: Rpub, Rpriv.

Sender makes 2 ephemeral key pairs: [{Epub1, Epriv1}, {Epub2, Epriv2}]

sender uses Epriv1 to sign the message we are sending. 

Sender deletes Epriv1.

Sender combines Epriv2 and Rpub to produce a shared secret SSER.

Sender uses Spriv to sign over (Epub1 + timestamp) and make SigET.

Message2 = (message to encrypt) + Epub1 + timestamp + SigET.

Sender uses SSER as the seed of a random number generator, to create as much randomness as the Message2. This randomness is XORed with the Message2 to produce the encrypted message.

Sender sends (encrypted message) + (Epub2) to the Receiver.

after some time, Epriv2 is published somewhere publicly, to make it possible to forge fake messages.

Group Method
===========

This problem is the same as calculating some shared secret that we all know in common.

1) choose 256 random bits to be the main shared secret.

2) make an ephemeral key pair.

3) calculated the individual shared secrets between your ephemeral private key, and each of the N potential recipients.

4) calculate the list of encoded secrets by XORing the main shared secret with each individual secret on the list.

5) use the main shared secret as the RNG seed to encrypt the message.

6) publish the encrypted message and the list of encoded secrets somewhere publicly.

So now if any recipient wants to decode the message. they start by combining the ephemeral key with their private key to calculate their individual shared secret.
Then they XOR this with the encoded secret in the list that was published with the message.
This reveals the shared secret, the shared secret can be used to decrypt the message.



How to use it
=========

with a erlang server:

`sh start.sh` to turn it on
`sh attach.sh` to connect to it and issue commands
`halt().` to turn it off, while connected.


here is an example page to visit on the same computer: `http://0.0.0.0:8000/main.html`
