import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/user-role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UpdateBookingStatusDto } from '../../bookings/dto/create-booking.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import {
  AdminBookingsQueryDto,
  AdminNotificationDto,
  AdminPaymentsQueryDto,
  AdminPackagesQueryDto,
  AdminReviewsQueryDto,
  AdminSessionsQueryDto,
  AdminStudentsQueryDto,
  AdminTeachersQueryDto,
  AdminUsersQueryDto,
  ReportQueryDto,
  UpdatePackageStatusDto,
} from '../dto/admin-query.dto';
import { AdminService } from '../services/admin.service';

@ApiTags('Admin')
@ApiBearerAuth('JWT')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get admin dashboard summary' })
  @ApiResponse({ status: 200, description: 'Dashboard returned' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get paginated users for admin' })
  @ApiResponse({ status: 200, description: 'Users returned' })
  getUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a user profile for admin' })
  @ApiResponse({ status: 200, description: 'User returned' })
  getUserById(@Param('userId') userId: string) {
    return this.adminService.getUserById(userId);
  }

  @Delete('users/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft delete a user' })
  @ApiResponse({ status: 200, description: 'User soft deleted' })
  deleteUser(@Param('userId') userId: string) {
    return this.adminService.softDeleteUser(userId);
  }

  @Patch('users/:userId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a user status' })
  @ApiBody({
    schema: {
      example: {
        status: 'active',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User status updated' })
  patchUserStatus(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(userId, dto.status);
  }

  @Get('teachers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get paginated teachers for admin' })
  @ApiResponse({ status: 200, description: 'Teachers returned' })
  getTeachers(@Query() query: AdminTeachersQueryDto) {
    return this.adminService.getTeachers(query);
  }

  @Get('teachers/:teacherId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a teacher profile for admin' })
  @ApiResponse({ status: 200, description: 'Teacher returned' })
  getTeacherById(@Param('teacherId') teacherId: string) {
    return this.adminService.getTeacherById(teacherId);
  }

  @Patch('teachers/:teacherId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a teacher account status' })
  @ApiBody({
    schema: {
      example: {
        status: 'active',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Teacher status updated' })
  updateTeacherStatus(
    @Param('teacherId') teacherId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateTeacherStatus(teacherId, dto.status);
  }

  @Patch('teachers/:teacherId/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve teacher verification' })
  @ApiResponse({ status: 200, description: 'Teacher verified' })
  verifyTeacher(@Param('teacherId') teacherId: string) {
    return this.adminService.verifyTeacher(teacherId);
  }

  @Patch('teachers/:teacherId/unverify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove teacher verification' })
  @ApiResponse({ status: 200, description: 'Teacher unverifed' })
  unverifyTeacher(@Param('teacherId') teacherId: string) {
    return this.adminService.unverifyTeacher(teacherId);
  }

  @Get('students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get paginated students for admin' })
  @ApiResponse({ status: 200, description: 'Students returned' })
  getStudents(@Query() query: AdminStudentsQueryDto) {
    return this.adminService.getStudents(query);
  }

  @Get('students/:studentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a student profile for admin' })
  @ApiResponse({ status: 200, description: 'Student returned' })
  getStudentById(@Param('studentId') studentId: string) {
    return this.adminService.getStudentById(studentId);
  }

  @Patch('students/:studentId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a student account status' })
  @ApiBody({
    schema: {
      example: {
        status: 'active',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Student status updated' })
  updateStudentStatus(
    @Param('studentId') studentId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateStudentStatus(studentId, dto.status);
  }

  @Get('bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get paginated bookings for admin' })
  @ApiResponse({ status: 200, description: 'Bookings returned' })
  getBookings(@Query() query: AdminBookingsQueryDto) {
    return this.adminService.getBookings(query);
  }

  @Get('bookings/:bookingId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a booking by id' })
  @ApiResponse({ status: 200, description: 'Booking returned' })
  getBookingById(@Param('bookingId') bookingId: string) {
    return this.adminService.getBookingById(bookingId);
  }

  @Patch('bookings/:bookingId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a booking status' })
  @ApiBody({
    schema: {
      example: {
        status: 'accepted',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Booking status updated' })
  updateBookingStatus(
    @Param('bookingId') bookingId: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.adminService.updateBookingStatus(bookingId, dto.status);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get paginated sessions for admin' })
  @ApiResponse({ status: 200, description: 'Sessions returned' })
  getSessions(@Query() query: AdminSessionsQueryDto) {
    return this.adminService.getSessions(query);
  }

  @Get('sessions/:sessionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a session by id' })
  @ApiResponse({ status: 200, description: 'Session returned' })
  getSessionById(@Param('sessionId') sessionId: string) {
    return this.adminService.getSessionById(sessionId);
  }

  @Patch('sessions/:sessionId/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel a session' })
  @ApiResponse({ status: 200, description: 'Session cancelled' })
  cancelSession(@Param('sessionId') sessionId: string) {
    return this.adminService.cancelSession(sessionId);
  }

  @Get('payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get paginated payments for admin' })
  @ApiResponse({ status: 200, description: 'Payments returned' })
  getPayments(@Query() query: AdminPaymentsQueryDto) {
    return this.adminService.getPayments(query);
  }

  @Get('payments/:paymentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a payment by id' })
  @ApiResponse({ status: 200, description: 'Payment returned' })
  getPaymentById(@Param('paymentId') paymentId: string) {
    return this.adminService.getPaymentById(paymentId);
  }

  @Patch('payments/:paymentId/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded' })
  refundPayment(@Param('paymentId') paymentId: string) {
    return this.adminService.refundPayment(paymentId);
  }

  @Get('kyc')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get KYC submissions for admin' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'KYC records returned' })
  getKyc(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
  ) {
    return this.adminService.getKyc(Number(page), Number(limit), status);
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get categories for admin review' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Categories returned' })
  getCategories(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.adminService.getCategories(Number(page), Number(limit));
  }

  @Get('subjects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get subjects for admin review' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Subjects returned' })
  getSubjects(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.adminService.getSubjects(Number(page), Number(limit));
  }

  @Get('packages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get packages for admin review' })
  @ApiResponse({ status: 200, description: 'Packages returned' })
  getPackages(@Query() query: AdminPackagesQueryDto) {
    return this.adminService.getPackages(query);
  }

  @Get('packages/:packageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a package by id' })
  @ApiResponse({ status: 200, description: 'Package returned' })
  getPackageById(@Param('packageId') packageId: string) {
    return this.adminService.getPackageById(packageId);
  }

  @Patch('packages/:packageId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update package active status' })
  @ApiBody({
    schema: {
      example: {
        status: 'active',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Package status updated' })
  updatePackageStatus(
    @Param('packageId') packageId: string,
    @Body() dto: UpdatePackageStatusDto,
  ) {
    return this.adminService.updatePackageStatus(packageId, dto.status);
  }

  @Get('reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get reviews for admin moderation' })
  @ApiResponse({ status: 200, description: 'Reviews returned' })
  getReviews(@Query() query: AdminReviewsQueryDto) {
    return this.adminService.getReviews(query);
  }

  @Delete('reviews/:reviewId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete abusive review' })
  @ApiResponse({ status: 200, description: 'Review deleted' })
  deleteReview(@Param('reviewId') reviewId: string) {
    return this.adminService.deleteReview(reviewId);
  }

  @Post('notifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send an admin notification' })
  @ApiResponse({ status: 201, description: 'Notification sent' })
  createNotification(@Body() dto: AdminNotificationDto) {
    return this.adminService.createNotification(dto);
  }

  @Get('notifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get notifications for admin' })
  @ApiResponse({ status: 200, description: 'Notifications returned' })
  getNotifications(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.adminService.getNotifications(Number(page), Number(limit));
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get admin analytics overview' })
  @ApiResponse({ status: 200, description: 'Analytics returned' })
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('reports/revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get revenue report' })
  @ApiResponse({ status: 200, description: 'Revenue report returned' })
  getRevenueReport(
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ) {
    return this.adminService.getRevenueReport(query, res);
  }

  @Get('reports/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get users report' })
  @ApiResponse({ status: 200, description: 'Users report returned' })
  getUsersReport(
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ) {
    return this.adminService.getUsersReport(query, res);
  }

  @Get('reports/bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get bookings report' })
  @ApiResponse({ status: 200, description: 'Bookings report returned' })
  getBookingsReport(
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ) {
    return this.adminService.getBookingsReport(query, res);
  }

  @Get('reports/payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get payments report' })
  @ApiResponse({ status: 200, description: 'Payments report returned' })
  getPaymentsReport(
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ) {
    return this.adminService.getPaymentsReport(query, res);
  }

  @Get('reports/teachers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get teachers report' })
  @ApiResponse({ status: 200, description: 'Teachers report returned' })
  getTeachersReport(
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ) {
    return this.adminService.getTeachersReport(query, res);
  }

  @Get('reports/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get students report' })
  @ApiResponse({ status: 200, description: 'Students report returned' })
  getStudentsReport(
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ) {
    return this.adminService.getStudentsReport(query, res);
  }

}
