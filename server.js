import { randomUUID } from 'crypto';
import fs from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

import express from 'express';

const app = express();
const port = 3000;
const __dirname = path.resolve();

app.use(express.json());

const dbName = process.env.TEST_ENV === 'e2e' ? 'e2e.json' : 'realEvents.json';

const getEvents = async () => {
  const data = await readFile(`${__dirname}/src/__mocks__/response/${dbName}`, 'utf8');

  return JSON.parse(data);
};

app.get('/api/events', async (_, res) => {
  const events = await getEvents();
  res.json(events);
});

app.post('/api/events', async (req, res) => {
  const events = await getEvents();
  const eventData = req.body;

  // 반복 일정 처리 로직
  if (eventData.repeat && eventData.repeat.type !== 'none') {
    const { repeat, date, ...restOfEvent } = eventData;
    const { type, interval = 1, endDate } = repeat;

    if (!endDate) {
      return res.status(400).send('endDate is required for recurring events.');
    }

    const seriesId = randomUUID();
    const createdEvents = [];
    let currentDate = new Date(date);
    const finalDate = new Date(endDate);

    // 참고: 'weekly' 반복의 경우, 현재는 시작 날짜와 동일한 요일에만 반복 생성됩니다.
    // 'daysOfWeek' 배열을 처리하는 로직은 추가 구현이 필요합니다.
    while (currentDate <= finalDate) {
      createdEvents.push({
        ...restOfEvent,
        id: randomUUID(),
        date: currentDate.toISOString().split('T')[0],
        seriesId,
        repeat,
      });

      switch (type) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7 * interval);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + interval);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + interval);
          break;
        default:
          // 알 수 없는 타입의 경우 무한 루프 방지
          currentDate.setTime(finalDate.getTime() + 1);
          break;
      }
    }

    fs.writeFileSync(
      `${__dirname}/src/__mocks__/response/${dbName}`,
      JSON.stringify({
        events: [...events.events, ...createdEvents],
      })
    );

    res.status(201).json(createdEvents);
  } else {
    // 단일 일정 생성 로직
    const newEvent = { id: randomUUID(), ...eventData };
    fs.writeFileSync(
      `${__dirname}/src/__mocks__/response/${dbName}`,
      JSON.stringify({
        events: [...events.events, newEvent],
      })
    );
    res.status(201).json(newEvent);
  }
});

app.post('/api/events/convert-to-recurring', async (req, res) => {
  const events = await getEvents();
  const eventData = req.body;

  // 기존 단일 이벤트 삭제
  const remainingEvents = events.events.filter((event) => event.id !== eventData.id);

  const { repeat, date, ...restOfEvent } = eventData;
  const { type, interval = 1, endDate } = repeat;

  if (!endDate) {
    return res.status(400).send('endDate is required for recurring events.');
  }

  const seriesId = randomUUID();
  const createdEvents = [];
  let currentDate = new Date(date);
  const finalDate = new Date(endDate);

  while (currentDate <= finalDate) {
    createdEvents.push({
      ...restOfEvent,
      id: randomUUID(),
      date: currentDate.toISOString().split('T')[0],
      seriesId,
      repeat,
    });

    switch (type) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7 * interval);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + interval);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + interval);
        break;
      default:
        currentDate.setTime(finalDate.getTime() + 1);
        break;
    }
  }

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/${dbName}`,
    JSON.stringify({
      events: [...remainingEvents, ...createdEvents],
    })
  );

  res.status(201).json(createdEvents);
});

app.put('/api/events-series/:seriesId', async (req, res) => {
  const events = await getEvents();
  const seriesId = req.params.seriesId;
  const updateData = req.body;

  const seriesEvents = events.events.filter((event) => event.seriesId === seriesId);

  if (seriesEvents.length === 0) {
    return res.status(404).send('Recurring series not found');
  }

  const newEvents = events.events.map((event) => {
    if (event.seriesId === seriesId) {
      return {
        ...event,
        title: updateData.title || event.title,
        description: updateData.description || event.description,
        location: updateData.location || event.location,
        category: updateData.category || event.category,
        notificationTime: updateData.notificationTime || event.notificationTime,
        repeat: updateData.repeat ? { ...event.repeat, ...updateData.repeat } : event.repeat,
      };
    }
    return event;
  });

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/${dbName}`,
    JSON.stringify({ events: newEvents })
  );

  res.json(seriesEvents);
});

app.put('/api/events/:id', async (req, res) => {
  const events = await getEvents();
  const id = req.params.id;
  const eventIndex = events.events.findIndex((event) => event.id === id);
  if (eventIndex > -1) {
    const newEvents = [...events.events];
    newEvents[eventIndex] = { ...events.events[eventIndex], ...req.body };

    fs.writeFileSync(
      `${__dirname}/src/__mocks__/response/${dbName}`,
      JSON.stringify({
        events: newEvents,
      })
    );

    res.json(events.events[eventIndex]);
  } else {
    res.status(404).send('Event not found');
  }
});

app.put('/api/events/:id/detach', async (req, res) => {
  const events = await getEvents();
  const id = req.params.id;
  const eventIndex = events.events.findIndex((event) => event.id === id && event.seriesId);
  if (eventIndex > -1) {
    const newEvents = [...events.events];
    const eventToDetach = { ...newEvents[eventIndex] };
    delete eventToDetach.seriesId;
    eventToDetach.repeat = { type: 'none', interval: 0 };
    newEvents[eventIndex] = eventToDetach;

    fs.writeFileSync(
      `${__dirname}/src/__mocks__/response/${dbName}`,
      JSON.stringify({
        events: newEvents,
      })
    );

    res.json(eventToDetach);
  } else {
    res.status(404).send('Event not found');
  }
});

app.delete('/api/events/:id', async (req, res) => {
  const events = await getEvents();
  const id = req.params.id;

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/${dbName}`,
    JSON.stringify({
      events: events.events.filter((event) => event.id !== id),
    })
  );

  res.status(204).send();
});

app.post('/api/events-list', async (req, res) => {
  const events = await getEvents();
  const repeatId = randomUUID();
  const newEvents = req.body.events.map((event) => {
    const isRepeatEvent = event.repeat.type !== 'none';
    return {
      id: randomUUID(),
      ...event,
      repeat: {
        ...event.repeat,
        id: isRepeatEvent ? repeatId : undefined,
      },
    };
  });

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/${dbName}`,
    JSON.stringify({
      events: [...events.events, ...newEvents],
    })
  );

  res.status(201).json(newEvents);
});

app.put('/api/events-list', async (req, res) => {
  const events = await getEvents();
  let isUpdated = false;

  const newEvents = [...events.events];
  req.body.events.forEach((event) => {
    const eventIndex = events.events.findIndex((target) => target.id === event.id);
    if (eventIndex > -1) {
      isUpdated = true;
      newEvents[eventIndex] = { ...events.events[eventIndex], ...event };
    }
  });

  if (isUpdated) {
    fs.writeFileSync(
      `${__dirname}/src/__mocks__/response/${dbName}`,
      JSON.stringify({
        events: newEvents,
      })
    );

    res.json(events.events);
  } else {
    res.status(404).send('Event not found');
  }
});

app.delete('/api/events-list', async (req, res) => {
  const events = await getEvents();
  const newEvents = events.events.filter((event) => !req.body.eventIds.includes(event.id)); // ? ids를 전달하면 해당 아이디를 기준으로 events에서 제거

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/${dbName}`,
    JSON.stringify({
      events: newEvents,
    })
  );

  res.status(204).send();
});

app.put('/api/recurring-events/:repeatId', async (req, res) => {
  const events = await getEvents();
  const repeatId = req.params.repeatId;
  const updateData = req.body;

  const seriesEvents = events.events.filter((event) => event.repeat.id === repeatId);

  if (seriesEvents.length === 0) {
    return res.status(404).send('Recurring series not found');
  }

  const newEvents = events.events.map((event) => {
    if (event.repeat.id === repeatId) {
      return {
        ...event,
        title: updateData.title || event.title,
        description: updateData.description || event.description,
        location: updateData.location || event.location,
        category: updateData.category || event.category,
        notificationTime: updateData.notificationTime || event.notificationTime,
        repeat: updateData.repeat ? { ...event.repeat, ...updateData.repeat } : event.repeat,
      };
    }
    return event;
  });

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/${dbName}`,
    JSON.stringify({ events: newEvents })
  );

  res.json(seriesEvents);
});

app.delete('/api/recurring-events/:repeatId', async (req, res) => {
  const events = await getEvents();
  const repeatId = req.params.repeatId;

  const remainingEvents = events.events.filter((event) => event.repeat.id !== repeatId);

  if (remainingEvents.length === events.events.length) {
    return res.status(404).send('Recurring series not found');
  }

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/${dbName}`,
    JSON.stringify({ events: remainingEvents })
  );

  res.status(204).send();
});

app.listen(port, () => {
  if (!fs.existsSync(`${__dirname}/src/__mocks__/response/${dbName}`)) {
    fs.writeFileSync(
      `${__dirname}/src/__mocks__/response/${dbName}`,
      JSON.stringify({
        events: [],
      })
    );
  }
  console.log(`Server running at http://localhost:${port}`);
});
