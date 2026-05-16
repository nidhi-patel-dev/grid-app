import prisma from '../lib/prisma.js';
import { userSchema, UserPayload } from '../lib/validation.js';

export class UserService {
  /**
   * Creates or updates a user with validation.
   */
  async upsertUser(id: string, data: Partial<UserPayload>) {
    const existing = await this.getUser(id);
    
    const username = data.username || existing?.username || `User-${id.slice(0, 8)}`;
    const color = data.color || existing?.color || this.generateRandomColor();

    // Validate data
    const validated = userSchema.parse({
      id,
      username,
      color,
    });

    return prisma.user.upsert({
      where: { id },
      update: {
        username: validated.username,
        color: validated.color,
      },
      create: {
        id,
        username: validated.username,
        color: validated.color,
      },
      include: {
        _count: {
          select: { tiles: true },
        },
      },
    });
  }

  /**
   * Fetches a user by ID.
   */
  async getUser(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tiles: true },
        },
      },
    });
  }

  /**
   * Generates a random hex color.
   */
  private generateRandomColor() {
    return (
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
    );
  }
}

export const userService = new UserService();
