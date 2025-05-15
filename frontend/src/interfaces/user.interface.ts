export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  googleId?: string;
  facebookId?: string;
  archived: boolean;
  profileImage?: string;
  roles: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GoogleUser {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

export interface FacebookUser {
  id: string;
  name: string;
  email: string;
  picture: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
}
