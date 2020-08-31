#!/usr/bin/python3

# run me like this:
#   socat TCP:ipsm.makarta.com:9999 EXEC:./6nimmt.py

import sys

blah;
oh noes

def echo(message):
    sys.stderr.write(message)
    sys.stderr.flush()

def send_message(message):
    echo("> " + message)
    print(message)
    sys.stdout.flush()

def send_message_player(name):
    send_message("player\n" + name + "\n")
    
###################

echo("6-Nimmt bot: Sam Smith and John Wharington\n")

send_message_player("SamJohn")

running = 1

while running:
    line = sys.stdin.readline()
    echo("< " + line)
    # TODO process line
    # if line has ?, it's requiring a response
    # if line is blank, exit straight away (set running to 0)

# to kill hanged (mid-game) server:
# echo -e "control\n\nstop\n\n" | socat ...

running = 0
# this doesn't do anything

