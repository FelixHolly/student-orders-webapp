import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-button',
  imports: [],
  templateUrl: './add-button.html',
  styleUrl: './add-button.scss',
})
export class AddButton {
  @Input() isOpen = false;
  @Input() ariaLabel = 'Toggle form';
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    this.clicked.emit();
  }
}
