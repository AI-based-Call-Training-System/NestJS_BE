import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface User {
  id: string;
  password: string;
  phone: string;
}

const filePath = path.join(__dirname, '../../users.txt');

@Injectable()
export class AuthService {
  private readUsers(): User[] {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return data
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          try {
            return JSON.parse(line) as User;
          } catch {
            console.error('Error parsing line:', line);
            return null;
          }
        })
        .filter((user): user is User => user !== null);
    } catch (e) {
      console.error('Error reading users file:', e);
      return [];
    }
  }

  private writeUser(user: User) {
    fs.appendFileSync(filePath, JSON.stringify(user) + '\n');
  }

  signup(id: string, password: string, phone: string) {
    const users = this.readUsers();
    if (users.find((user) => user.id === id)) {
      console.log('already exists:', id);
      return { success: false, message: 'User already exists' };
    }
    const newUser: User = { id, password, phone };
    this.writeUser(newUser);
    console.log('User created:', newUser);
    return { success: true, message: 'User created successfully' };
  }

  login(id: string, password: string) {
    try {
      const users = this.readUsers();
      const user = users.find((u) => u.id === id && u.password === password);
      if (user) {
        console.log('Login successful:', user.id);
        return {
          success: true,
          message: 'Login successful',
          user: { id: user.id, phone: user.phone },
        };
      } else {
        console.log('Invalid credentials:', id);
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (e) {
      console.error('Login failed:', e);
      return { success: false, message: 'Login failed' };
    }
  }
}
