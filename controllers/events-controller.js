const { PrismaClient } = require("@prisma/client");
const { generateError, generatDefaultError } = require("../helpers/common");
const prisma = new PrismaClient();
const moment = require("moment");

const membersPublicAttributes = {
  id: true,
  firstName: true,
  lastName: true,
  emailAddress: true,
  mobileNumber: true,
  whatsAppNumber: true,
  password: false,
};

// Get all attendees of an event by code

exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      select: {
        name: true,
        date: true,
        meetingPoint: true,
        meetingTime: true,
        details: true,
        members: {
          select: membersPublicAttributes,
        },
      },
    });

    if (events) {
      res.status(200).send(events);
    } else {
      generateError("No events found", req, next);
    }
  } catch (err) {
    generatDefaultError(err, req, next);
  }
};

exports.getAttendeesByEventId = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const _attendees = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        members: true,
      },
    });

    if (_attendees && _attendees.members.length > 0)
      res.status(200).send(_attendees);
    else generateError("No attendees for this event", req, next);
  } catch (err) {
    generatDefaultError(err, req, next);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const { name, date, meetingPoint, meetingTime, details } = req.body;

    const newEvent = await prisma.event.create({
      data: {
        name,
        date: moment(date).format(),
        meetingPoint,
        meetingTime,
        details,
      },
    });

    if (newEvent) {
      res.status(200).send(newEvent);
    } else {
      generateError("Failed to create event", req, next);
    }
  } catch (err) {
    generatDefaultError(err, req, next);
  }
};

exports.registerForEvent = async (req, res, next) => {
  try {
    const { memberId, eventId } = req.body;
    const _member = await prisma.member.update({
      where: { id: memberId },
      data: {
        events: {
          connect: {
            id: eventId,
          },
        },
      },
    });

    if (_member) {
      res.status(200).send({ msg: "Successfully registered for the event" });
    } else {
      generateError("Failed to register for event", req, next);
    }
  } catch (err) {
    generatDefaultError(err, req, next);
  }
};
