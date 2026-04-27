import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class AppService {

  constructor(@Inject('CACHE_MANAGER') private cacheManager: Cache) {}
  getHello(): string {
    return 'Hello World!';
  }

  async getStudents() {
    // const cachedData = await this.cacheManager.get('students');
    // if (cachedData) {
    //   console.log('Got data from cache');
    //   return cachedData;
    // }

    console.log("Inside service....")
    
    const studentsData = await this.retrieveStudentsFromDB();
    // await this.cacheManager.set('students', studentsData, 60 * 1000);
    return studentsData;
  }

  async retrieveStudentsFromDB() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const students = [
          { name: 'John', age: 20, GPA: 3.5 },
          { name: 'Jane', age: 22, GPA: 3.8 },
          { name: 'Bob', age: 21, GPA: 3.2 },
        ];
        resolve(students);
      }, 2000); // Simulate 2 second DB delay
    });
  }
}
