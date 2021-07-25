import { Component, Input, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { Toast } from '@capacitor/toast';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @Input() firstName: string | undefined;
  @Input() lastName: string | undefined;

  private keys = {
    firstName: 'firstName',
    lastName: 'lastName',
  };

  constructor() {}

  async ngOnInit(): Promise<void> {
    this.firstName = await this.getValue(this.keys.firstName);
    this.lastName = await this.getValue(this.keys.lastName);
  }

  async save(): Promise<void> {
    if (this.firstName && this.lastName) {
      await this.setValue(this.keys.firstName, this.firstName);
      await this.setValue(this.keys.lastName, this.lastName);
    }
  }

  async clear(): Promise<void> {
    this.firstName = '';
    this.lastName = '';
    return Storage.clear();
  }

  async sayHi(): Promise<void> {
    if (this.firstName && this.lastName) {
      await Toast.show({
        text: `Hello ${this.firstName} ${this.lastName}`,
      });
    }
  }

  private async getValue(key: string): Promise<string> {
    const { value } = await Storage.get({ key });
    return value;
  }

  private setValue(key: string, value: string): Promise<void> {
    return Storage.set({ key, value });
  }
}
