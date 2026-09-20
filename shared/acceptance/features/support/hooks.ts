import { After, Before, setDefaultTimeout } from '@cucumber/cucumber';
import { TaskFlowWorld } from './world';

setDefaultTimeout(30_000);

Before(function (this: TaskFlowWorld) {
  this.token = null;
  this.currentUser = null;
  this.users = {};
  this.projects = {};
  this.tasks = {};
  this.viewedComments = [];
  this.notifications = [];
});

After(function (this: TaskFlowWorld) {
  if (this.socket) {
    this.socket.close();
    this.socket = null;
  }
});
