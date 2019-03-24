/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MedicalInfoService } from './MedicalInfo.service';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'app-medicalinfo',
  templateUrl: './MedicalInfo.component.html',
  styleUrls: ['./MedicalInfo.component.css'],
  providers: [MedicalInfoService]
})
export class MedicalInfoComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
  private errorMessage;

  owner = new FormControl('', Validators.required);
  medId = new FormControl('', Validators.required);
  medication = new FormControl('', Validators.required);
  pastVisitsArray = new FormControl('', Validators.required);
  permissionedDoctorsId = new FormControl('', Validators.required);

  constructor(public serviceMedicalInfo: MedicalInfoService, fb: FormBuilder) {
    this.myForm = fb.group({
      owner: this.owner,
      medId: this.medId,
      medication: this.medication,
      pastVisitsArray: this.pastVisitsArray,
      permissionedDoctorsId: this.permissionedDoctorsId
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): Promise<any> {
    const tempList = [];
    return this.serviceMedicalInfo.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(asset => {
        tempList.push(asset);
      });
      this.allAssets = tempList;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the asset field to update
   * @param {any} value - the enumeration value for which to toggle the checked state
   */
  changeArrayValue(name: string, value: any): void {
    const index = this[name].value.indexOf(value);
    if (index === -1) {
      this[name].value.push(value);
    } else {
      this[name].value.splice(index, 1);
    }
  }

	/**
	 * Checkbox helper, determining whether an enumeration value should be selected or not (for array enumeration values
   * only). This is used for checkboxes in the asset updateDialog.
   * @param {String} name - the name of the asset field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified asset field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addAsset(form: any): Promise<any> {
    this.asset = {
      $class: 'org.healthcare.basic.MedicalInfo',
      'owner': this.owner.value,
      'medId': this.medId.value,
      'medication': this.medication.value,
      'pastVisitsArray': this.pastVisitsArray.value,
      'permissionedDoctorsId': this.permissionedDoctorsId.value
    };

    this.myForm.setValue({
      'owner': null,
      'medId': null,
      'medication': null,
      'pastVisitsArray': null,
      'permissionedDoctorsId': null
    });

    return this.serviceMedicalInfo.addAsset(this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'owner': null,
        'medId': null,
        'medication': null,
        'pastVisitsArray': null,
        'permissionedDoctorsId': null
      });
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
          this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else {
          this.errorMessage = error;
      }
    });
  }


  updateAsset(form: any): Promise<any> {
    this.asset = {
      $class: 'org.healthcare.basic.MedicalInfo',
      'owner': this.owner.value,
      'medication': this.medication.value,
      'pastVisitsArray': this.pastVisitsArray.value,
      'permissionedDoctorsId': this.permissionedDoctorsId.value
    };

    return this.serviceMedicalInfo.updateAsset(form.get('medId').value, this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }


  deleteAsset(): Promise<any> {

    return this.serviceMedicalInfo.deleteAsset(this.currentId)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  setId(id: any): void {
    this.currentId = id;
  }

  getForm(id: any): Promise<any> {

    return this.serviceMedicalInfo.getAsset(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'owner': null,
        'medId': null,
        'medication': null,
        'pastVisitsArray': null,
        'permissionedDoctorsId': null
      };

      if (result.owner) {
        formObject.owner = result.owner;
      } else {
        formObject.owner = null;
      }

      if (result.medId) {
        formObject.medId = result.medId;
      } else {
        formObject.medId = null;
      }

      if (result.medication) {
        formObject.medication = result.medication;
      } else {
        formObject.medication = null;
      }

      if (result.pastVisitsArray) {
        formObject.pastVisitsArray = result.pastVisitsArray;
      } else {
        formObject.pastVisitsArray = null;
      }

      if (result.permissionedDoctorsId) {
        formObject.permissionedDoctorsId = result.permissionedDoctorsId;
      } else {
        formObject.permissionedDoctorsId = null;
      }

      this.myForm.setValue(formObject);

    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  resetForm(): void {
    this.myForm.setValue({
      'owner': null,
      'medId': null,
      'medication': null,
      'pastVisitsArray': null,
      'permissionedDoctorsId': null
      });
  }

}
