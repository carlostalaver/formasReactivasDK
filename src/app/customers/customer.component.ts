import { Component, OnInit } from '@angular/core';
import { NgForm, FormBuilder, FormArray, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Customer } from './customer';
import {debounceTime} from 'rxjs/operators';


/* Ojo esta funcion solo puede recibir un y solo un parametro  */
function ratingRange( c: AbstractControl): {[key: string]: boolean} | null {
  if ( c.value !== null && (isNaN(c.value) || c.value < 1 || c.value > 5)) {
    return { 'range': true };
  }
  return void 0;
}

/* Creando un fabrica de funciones */
function ratingRange2(min: number, max: number): ValidatorFn {
  return ( c: AbstractControl): {[key: string]: boolean} | null => {
    if ( c.value !== null && (isNaN(c.value) || c.value < min || c.value > max)) {
      return { 'range': true };
    }
    return void 0;
  };
}

/* Validar igualdad en emails */
function emailMatcher(c: AbstractControl): { [key: string]: boolean } | null {
  const emailControl = c.get('email');
  const confirmControl = c.get('confirmEmail');

  if ( emailControl.pristine || confirmControl.pristine) {
    return null;
  }
  if (emailControl.value === confirmControl.value) {
    return null;
  }
  return { 'match': true };
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  customer = new Customer();
  emailMessage: string;

  constructor(private fb: FormBuilder) { }

  private validationMessages = {
    required: 'Please enter your mail address.',
    email: 'Please enter a valid email address.'
  };

  get addresses(): FormArray {
    return <FormArray>this.customerForm.get('addresses');
  }
  ngOnInit() {

    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(5)]],
      lastName: ['', [Validators.required, Validators.minLength(40)]],
      emailGroup: this.fb.group({
        email: [null, [Validators.required, Validators.email]],
        confirmEmail: [null, [Validators.required]]
      }, { validator: emailMatcher }), /* asi se llama a la funcion que validará si los email son iguales */
      phone: [null],
      notification: 'email',
      rating: [null, [ratingRange2(1, 5)]],
      sendCatalog: true,
      addresses: this.fb.array([ this.buildAddress()])
    });

    this.customerForm.get('notification').valueChanges.subscribe(value => {
      this.setNotification(value);
    });

    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges
    .pipe(
      debounceTime(1000)
    )
    .subscribe( value => {
      this.setMessage(emailControl);
    });
/*     this.customerForm = new FormGroup({
      firstName: new FormControl(),
      lastName: new FormControl(),
      email: new FormControl(),
      sendCatalog: new FormControl(true)
    }); */
  }

  save() {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  populateTestData(): void {
    this.customerForm.patchValue({
      firstName: 'cart',
      lastName: 'Tala',
      email: 'cart@gmail.com',
      sendCatalog: false
    });
  }

/* para SETVALUE se debe setear todo los formControls del formGroup  */
  populateTestData2(): void {
    this.customerForm.setValue({
      firstName: 'cart',
      lastName: 'Tala',
      email: 'cart@gmail.com',
      sendCatalog: false
    });
  }

  setNotification(notification: string) {
    const phoneControl = this.customerForm.get('phone');
    if (notification === 'text') {
      phoneControl.setValidators(Validators.required);
    } else {
      phoneControl.clearValidators();
    }

    phoneControl.updateValueAndValidity();
  }

  setMessage(c: AbstractControl): void {
    this.emailMessage = '';
    if ((c.touched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(key => this.emailMessage += this.validationMessages[key]).join(' ');
    }
  }

  buildAddress(): FormGroup {
    return this.fb.group({
      addressType: 'home',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: ''
    });
  }

  addAddress(): void {
    this.addresses.push(this.buildAddress());
  }
}
