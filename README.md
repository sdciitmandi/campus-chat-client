## Campus Anonymous Chat Client

We are almost done with the basic structure. The app is now capable of the following functions:

1. Connecting two strangers if they are not connected to anyone else.
2. Carrying messages from the two strangers to just each other.
3. Show that the stranger has disconnected.
4. Reconnect the user if other free users are available.

## To Do

The following features are yet to be implemented:

* Most importantly, make the message window auto scroll. Right now , if number of messages increase beyond the height of the message box, it becomes impossible to read them.
* Implement a better style for the page, right now it is primitive in visual style.
* If the user is not connected , his messages should not be accepted. Right now his messages are appended to the screen.
* Implement User Groups. This is something with great potential if done properly. IRC has had this for long, but most people don't use it anyway.
We will implement a way for the users to create groups from within a chat, and allow many users to chat within a group.
* Allow handling of nicknames.
* New Bug, if user is not connected and he closes his tab,the node server thinks that he is a free user.

## How to Use

Clone the git repo somewhere and cd into it. Then run npm install in the directory. After that it should be ready to use.

```shell
git clone https://github.com/sdciitmandi/campus-chat-client.git
cd campus-chat-client
npm install
# Now run the app
node index.js
```
