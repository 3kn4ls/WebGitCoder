import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  activeTab: 'explorer' | 'git' = 'explorer';

  setActiveTab(tab: 'explorer' | 'git') {
    this.activeTab = tab;
  }
}
