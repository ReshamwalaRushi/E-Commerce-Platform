import { User, IUser } from '../models/User.model';
import { generateToken, generateRefreshToken, TokenPayload } from '../utils/jwt.util';
import { UnauthorizedError, ValidationError } from '../utils/apiError.util';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  token: string;
  refreshToken: string;
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const existingUser = await User.findOne({ email: data.email });
    
    if (existingUser) {
      throw new ValidationError('Email already exists');
    }

    const user = await User.create(data);

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const user = await User.findOne({ email: data.email }).select('+password');
    
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(data.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }
}

export default new AuthService();
