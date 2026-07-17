import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Booking, BookingDocument, BookingStatus } from '../../bookings/schema/booking.schema';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { UsersService } from '../../users/services/users.service';
import { CreateSessionDto } from '../dto/create-session.dto';
import { Session, SessionDocument, SessionStatus } from '../schema/session.schema';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createSession(teacherId: string, dto: CreateSessionDto) {
    const teacher = await this.usersService.findById(teacherId);
    if (!teacher) {
      throw new UnauthorizedException('Teacher not found.');
    }

    const booking = await this.bookingModel.findById(dto.bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    if (booking.teacherId !== teacherId || booking.status !== BookingStatus.ACCEPTED) {
      throw new UnauthorizedException('Only accepted bookings can create a session.');
    }

    const existingSession = await this.sessionModel.findOne({ bookingId: dto.bookingId });
    if (existingSession) {
      throw new UnauthorizedException('A session already exists for this booking.');
    }

    const session = await this.sessionModel.create({
      bookingId: dto.bookingId,
      studentId: booking.studentId,
      teacherId,
      subject: booking.subject,
      scheduledAt: new Date(dto.scheduledAt),
      notes: dto.notes ?? null,
      status: SessionStatus.SCHEDULED,
    });

    await this.notificationsService.notifySessionStarted(booking.studentId, teacherId, session.id);
    return session;
  }

  async getSessions(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.sessionModel.find().sort({ scheduledAt: -1 }).skip(skip).limit(limit).exec(),
      this.sessionModel.countDocuments(),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getStudentSessions(studentId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.sessionModel.find({ studentId }).sort({ scheduledAt: -1 }).skip(skip).limit(limit).exec(),
      this.sessionModel.countDocuments({ studentId }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getTeacherSessions(teacherId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.sessionModel.find({ teacherId }).sort({ scheduledAt: -1 }).skip(skip).limit(limit).exec(),
      this.sessionModel.countDocuments({ teacherId }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async startSession(sessionId: string, teacherId: string) {
    const session = await this.sessionModel.findOne({ _id: sessionId, teacherId });
    if (!session) {
      throw new NotFoundException('Session not found.');
    }

    if (session.status === SessionStatus.CANCELLED) {
      throw new UnauthorizedException('Cannot start a cancelled session.');
    }

    session.status = SessionStatus.IN_PROGRESS;
    session.startedAt = new Date();
    const saved = await session.save();
    await this.notificationsService.notifySessionStarted(session.studentId, session.teacherId, session.id);
    return saved;
  }

  async endSession(sessionId: string, teacherId: string) {
    const session = await this.sessionModel.findOne({ _id: sessionId, teacherId });
    if (!session) {
      throw new NotFoundException('Session not found.');
    }

    session.status = SessionStatus.COMPLETED;
    session.endedAt = new Date();
    const saved = await session.save();
    await this.notificationsService.notifySessionEnded(session.studentId, session.teacherId, session.id);
    return saved;
  }

  async cancelSession(sessionId: string, teacherId: string) {
    const session = await this.sessionModel.findOne({ _id: sessionId, teacherId });
    if (!session) {
      throw new NotFoundException('Session not found.');
    }

    session.status = SessionStatus.CANCELLED;
    return session.save();
  }
}
