import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';


/* Ojo esta funcion solo puede recibir un y solo un parametro  */
function ratingRange(c: AbstractControl): { [key: string]: boolean } | null {
  if (c.value !== null && (isNaN(c.value) || c.value < 1 || c.value > 5)) {
    return { 'range': true };
  }
  return void 0;
}

/* Creando un fabrica de funciones puedo pasar los parametros que desee*/
function ratingRange2(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if (c.value !== null && (isNaN(c.value) || c.value < min || c.value > max)) {
      return { 'range': true };
    }
    return void 0;
  };
}

/* Validar igualdad en emails */
function emailMatcher(c: AbstractControl): { [key: string]: boolean } | null {

  const emailControl = c.get('email');
  const confirmControl = c.get('confirmEmail');

  if (emailControl.pristine || confirmControl.pristine) {
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
  emailMessage: string;

  mensajes: Object = {
    emailMessage: null,
    emailConfirMessage: null
  };

  private validationMessages = {
    required: 'Please enter your mail address.',
    email: 'Please enter a valid email address.',
    match: 'No coinciden los emails'
  };

  constructor(private fb: FormBuilder) { }

  ngOnInit() {

    this.customerForm = this.fb.group({
      firstName: [null, [Validators.required, Validators.minLength(5)]],
      lastName: [null, [Validators.required, Validators.minLength(40)]],
      emailGroup: this.fb.group({
        email: [null, [Validators.required, Validators.email]],
        confirmEmail: [null, [Validators.required, Validators.email]]
      }, { validator: emailMatcher }), /* para aplicar la validacion de campos cruzados se debe proporcionar un objeto con key validator
                                         y valor el nombre de la funcion que validará si los email son iguales */
      phone: [null],
      notification: 'email',
      rating: [null, [ratingRange2(1, 5)]],
      sendCatalog: true,
      addresses: this.fb.array([this.buildAddress()])
    });

    this.customerForm.get('notification').valueChanges.subscribe((value: string) => {
      this.setNotification(value);
    });

    this.customerForm.get('emailGroup').valueChanges.subscribe(valor => {
      // my code
    });




    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges
      .pipe(debounceTime(1000))
      .subscribe(value => {
        this.setMessage_2(emailControl, 'emailMessage');
      });

    const emailConfirmControl = this.customerForm.get('emailGroup.confirmEmail');
    emailConfirmControl.valueChanges /* se lo agrego al observable ANTES de subscribirme */
      .pipe(debounceTime(1000))
      .subscribe(value => {
        this.setMessage_2(emailConfirmControl, 'emailConfirMessage');
      });


    /*    manera convencional
          this.customerForm = new FormGroup({
          firstName: new FormControl(),
          lastName: new FormControl(),
          email: new FormControl(),
          sendCatalog: new FormControl(true)
        }); */
  }

  /* para patchValue se puede setear algunos o todos los formControls del formGroup  */
  populateTestData(): void {
    this.customerForm.patchValue({
      firstName: 'cart',
      lastName: 'Tala',
      email: 'cart@gmail.com',
      sendCatalog: false
    });
  }

  /* para SETVALUE se debe setear todo y cada unos los formControls del formGroup  */
  populateTestData2(): void {
    this.customerForm.setValue({
      firstName: 'cart',
      lastName: 'Tala',
      email: 'cart@gmail.com',
      sendCatalog: false
    });
  }


  save() {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
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
    if ((!c.untouched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(key => this.emailMessage += this.validationMessages[key]).join(' ');
    }
  }

  setMessage_2(c: AbstractControl, msj: string): void {
    this.mensajes[msj] = '';
    if ((c.untouched || c.dirty) && c.errors) {
      this.mensajes[msj] = Object.keys(c.errors)
        .map(key => this.mensajes[msj] += this.validationMessages[key]).join(' ');
    }
    if ((c.untouched || c.dirty) && this.customerForm.get('emailGroup').errors) {
      const match = this.customerForm.get('emailGroup').errors.match;
      if (match) {
        this.mensajes[msj] = '';
        this.mensajes[msj] = this.validationMessages['match'];
      }
    }
  }


  get addresses(): FormArray {
    return (this.customerForm.get('addresses') as FormArray);
   // return <FormArray>this.customerForm.get('addresses');
  }
  addAddress(): void {
    this.addresses.push(this.buildAddress());
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


}
