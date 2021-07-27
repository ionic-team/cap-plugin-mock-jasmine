import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Storage } from '@capacitor/storage';
import { Toast } from '@capacitor/toast';
import { IonicModule } from '@ionic/angular';
import { click, setInputValue } from '@test/util';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HomePage],
        imports: [FormsModule, IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(HomePage);
      component = fixture.componentInstance;
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialzation', () => {
    beforeEach(() => {
      spyOn(Storage, 'get');
      (Storage.get as any)
        .withArgs({ key: 'firstName' })
        .and.returnValue(Promise.resolve({ value: 'Jason' }));
      (Storage.get as any)
        .withArgs({ key: 'lastName' })
        .and.returnValue(Promise.resolve({ value: 'Jones' }));
      fixture.detectChanges();
    });

    it('gets the stored first name', async () => {
      await fixture.whenRenderingDone();
      expect(component.firstName).toEqual('Jason');
    });

    it('gets the stored last name', async () => {
      await fixture.whenRenderingDone();
      expect(component.lastName).toEqual('Jones');
    });
  });

  describe('saving', () => {
    let firstName: DebugElement;
    let lastName: DebugElement;
    let save: DebugElement;

    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenRenderingDone();
      firstName = fixture.debugElement.query(
        By.css('[data-testid="firstName"]')
      );
      lastName = fixture.debugElement.query(By.css('[data-testid="lastName"]'));
      save = fixture.debugElement.query(By.css('[data-testid="save"]'));
      spyOn(Storage, 'set');
    });

    it('saves the first and last name if both have been entered', async () => {
      setInputValue(firstName.nativeElement, 'Kenneth');
      setInputValue(lastName.nativeElement, 'Johnstone');
      fixture.detectChanges();
      click(save.nativeElement);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(Storage.set).toHaveBeenCalledTimes(2);
      expect(Storage.set).toHaveBeenCalledWith({
        key: 'firstName',
        value: 'Kenneth',
      });
      expect(Storage.set).toHaveBeenCalledWith({
        key: 'lastName',
        value: 'Johnstone',
      });
    });

    it('does not save if only a first name has been entered', async () => {
      setInputValue(firstName.nativeElement, 'Kevin');
      fixture.detectChanges();
      click(save.nativeElement);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(Storage.set).not.toHaveBeenCalled();
    });

    it('does not save if only a last name has been entered', async () => {
      setInputValue(lastName.nativeElement, 'Smith');
      fixture.detectChanges();
      click(save.nativeElement);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(Storage.set).not.toHaveBeenCalled();
    });

    it('does not save if neither a first nor last name have been entered', async () => {
      click(save.nativeElement);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(Storage.set).not.toHaveBeenCalled();
    });
  });

  describe('clearing', () => {
    let clear: DebugElement;
    beforeEach(async () => {
      spyOn(Storage, 'get');
      (Storage.get as any)
        .withArgs({ key: 'firstName' })
        .and.returnValue(Promise.resolve({ value: 'Jason' }));
      (Storage.get as any)
        .withArgs({ key: 'lastName' })
        .and.returnValue(Promise.resolve({ value: 'Jones' }));
      fixture.detectChanges();
      await fixture.whenStable();
      clear = fixture.debugElement.query(By.css('[data-testid="clear"]'));
    });

    it('clears the storage', () => {
      spyOn(Storage, 'clear');
      click(clear.nativeElement);
      fixture.detectChanges();
      expect(Storage.clear).toHaveBeenCalledTimes(1);
    });

    it('clears the first name', () => {
      click(clear.nativeElement);
      fixture.detectChanges();
      expect(component.firstName).toBeFalsy();
    });

    it('clears the last name', () => {
      click(clear.nativeElement);
      fixture.detectChanges();
      expect(component.lastName).toBeFalsy();
    });
  });

  describe('say hi', () => {
    let firstName: DebugElement;
    let lastName: DebugElement;
    let sayHi: DebugElement;

    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenRenderingDone();
      firstName = fixture.debugElement.query(
        By.css('[data-testid="firstName"]')
      );
      lastName = fixture.debugElement.query(By.css('[data-testid="lastName"]'));
      sayHi = fixture.debugElement.query(By.css('[data-testid="hello"]'));
      spyOn(Toast, 'show');
    });

    it('displays a toast if there is a first and last name', async () => {
      setInputValue(firstName.nativeElement, 'Kenneth');
      setInputValue(lastName.nativeElement, 'Johnstone');
      fixture.detectChanges();
      click(sayHi.nativeElement);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(Toast.show).toHaveBeenCalledTimes(1);
    });

    it('does not display anything if there is no first name', async () => {
      setInputValue(lastName.nativeElement, 'Johnstone');
      fixture.detectChanges();
      click(sayHi.nativeElement);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(Toast.show).not.toHaveBeenCalled();
    });

    it('does not display anything if there is no last name', async () => {
      setInputValue(firstName.nativeElement, 'Kenneth');
      fixture.detectChanges();
      click(sayHi.nativeElement);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(Toast.show).not.toHaveBeenCalled();
    });
  });
});
