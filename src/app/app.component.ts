import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'WebGitCoder';
  sidebarWidth = 250;
  isResizing = false;

  onMouseDown(event: MouseEvent) {
    this.isResizing = true;
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;

    const newWidth = event.clientX;
    if (newWidth >= 150 && newWidth <= 600) {
      this.sidebarWidth = newWidth;
    }
  }

  onMouseUp() {
    this.isResizing = false;
  }
}
