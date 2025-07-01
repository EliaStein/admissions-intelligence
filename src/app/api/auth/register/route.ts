import { NextRequest, NextResponse } from 'next/server';
import { UserService, CreateUserRequest } from '../../../../services/userService';

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
}

const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, message: 'At least 8 characters long' },
  { regex: /[A-Z]/, message: 'Contains uppercase letter' },
  { regex: /[a-z]/, message: 'Contains lowercase letter' },
  { regex: /[0-9]/, message: 'Contains number' },
  { regex: /[^A-Za-z0-9]/, message: 'Contains special character' }
];

function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  PASSWORD_REQUIREMENTS.forEach(req => {
    if (!req.regex.test(password)) {
      errors.push(req.message);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, firstName, lastName, referralCode } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password requirements
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    // Validate name fields
    if (firstName.trim().length < 1 || lastName.trim().length < 1) {
      return NextResponse.json(
        { error: 'First name and last name must not be empty' },
        { status: 400 }
      );
    }

    // Create user data object
    const userData: CreateUserRequest = {
      email: email.toLowerCase().trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      referralCode: referralCode?.trim() || undefined
    };

    // Create the user
    const result = await UserService.createUser(userData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create user' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: result.user?.id,
        email: result.user?.email,
        first_name: result.user?.first_name,
        last_name: result.user?.last_name,
        role: result.user?.role
      }
    });

  } catch (error) {
    console.error('Error in register API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
