import { autoInjectable } from 'tsyringe';
import CustomerModel from '../models/customer';

@autoInjectable()
export class CustomerService {

  async verifyCustomerEmail(){}

  async createUser(userData: any) {
    return await CustomerModel.create(userData);
  }

  async getUserById(id: number) {
    return await CustomerModel.findByPk(id);
  }

  async getAllUsers() {
    return await CustomerModel.findAll();
  }
}
