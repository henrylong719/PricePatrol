import { Request, Response, NextFunction } from 'express';

const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);

  next();
};

export { sanitizeInput };
