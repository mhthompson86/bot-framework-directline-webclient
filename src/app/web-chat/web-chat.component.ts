import {Component, OnInit} from '@angular/core';
import {DirectlineService} from '../directline.service';
import {Activity} from '../activity';
import {ActivityType} from '../activity-type';
import {ConnectionStatus} from 'botframework-directlinejs';


@Component({
  selector: 'app-web-chat',
  templateUrl: './web-chat.component.html',
  styleUrls: ['./web-chat.component.css']
})
export class WebChatComponent implements OnInit {
  activities: Activity[] = [];
  status = ConnectionStatus.Uninitialized;
  newMessage = '';

  constructor(private dl: DirectlineService) {
  }

  ngOnInit() {
    this.dl.monitorConnection().subscribe(connectionStatus => {
      console.log(`DirectLine connection status`, connectionStatus);
    });

    this.dl.listenForMessages().subscribe(activity => {
      this.activities.push(activity);
      console.log('received message from bot:', activity);
      this.scrollToBottom();
    });

    this.dl.listenForOtherActivities().subscribe(activity => console.log('other activities from bot:', activity));

    this.dl.monitorConnection().subscribe(status => {
      this.updateConnectionStatus(status);
    });
  }

  postMessage() {
    const activity = new Activity(
      this.newMessage,
      {id: 'default-user', name: 'User'},
      ActivityType.MESSAGE
  );
    this.activities.push(activity);
    this.dl.post(activity)
      .subscribe(() => this.scrollToBottom(), e => console.log('Error posting activity', e));
    this.newMessage = '';
  }

  updateConnectionStatus(status) {
    this.status = status;
    switch (status) {
      case ConnectionStatus.Uninitialized: // the status when the DirectLine object is first created/constructed
      case ConnectionStatus.Connecting:       // currently trying to connect to the conversation
      case ConnectionStatus.Online:           // successfully connected to the converstaion. Connection is healthy so far as we know.
      case ConnectionStatus.ExpiredToken:     // last operation errored out with an expired token. Your app should supply a new one.
      case ConnectionStatus.FailedToConnect:  // the initial attempt to connect to the conversation failed. No recovery possible.
      case ConnectionStatus.Ended:            // the bot ended the conversation
      default:
        console.log('connection status changed:', status);
    }
  }

  // this is a pain in the ass...
  scrollToBottom() {
    const div = window.document.getElementById('chat-content');
    div.scrollTop = div.scrollHeight;
  }


}
