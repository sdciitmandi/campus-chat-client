## Guidelines for Contributing

The following are the recommended steps to make a contribution:
1. Fork this repo on github. Now you will have a repo of this name(campus-chat-client) in your github account.
2. Clone the repo from you github account:
```shell
git clone https://github.com/your-user-name/campus-chat-client.git
cd campus-chat-client
npm install
```
3. Check that the app works.
4. Add the sdc repo as a remote
```shell
git remote add upstream https://github.com/sdciitmandi/campus-chat-client.git
```
5. Make all your changes in a new branch, with the branch name chosen according to the changes you are making.
6. Push your changes to the repo in your github account.
```shell
git push origin branch-name
```
7. Go to your github account , and open this repo, you will see an option to send a pull request.
8. Now , keep on working on your local repo. If you want to bring your local repo uptodate with the sdc one , run
```shell
git pull upstream master
```
