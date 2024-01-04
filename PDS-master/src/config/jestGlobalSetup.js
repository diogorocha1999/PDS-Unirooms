require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../models');

const create = async () => {
  await db.sequelize
    .sync({ force: true })
    .then(() => {
      console.log('Drop and Resync Db');
    })
    .catch((error) => console.error(error));
};

// TO DO: Dates should be relative to current date
const demodataset = async () => {
  try {
    // -------------------------
    // ------ User Roles -------
    // -------------------------
    await db.role.create({
      roleId: 1,
      name: 'user',
    });

    await db.role.create({
      roleId: 2,
      name: 'admin',
    });

    await db.role.create({
      roleId: 3,
      name: 'seller',
    });

    await db.role.create({
      roleId: 4,
      name: 'student',
    });

    // -------------------------
    // ----- SystemSettings ----
    // -------------------------
    await db.systemsettings.create({
      Id: 1,
      transactionFee: 10,
      depositFee: 20,
      depositTimeLimit: 172800,
    });

    // -------------------------
    // -------- Location -------
    // -------------------------

    await db.country.create({
      name: 'Portugal',
      code: 'PT',
    });

    await db.region.create({
      name: 'Braga',
      code: 'BG',
      country_id: 1,
    });

    await db.region.create({
      name: 'Porto',
      code: 'PT',
      country_id: 1,
    });

    await db.city.create({
      name: 'Barcelos',
      country_id: 1,
      region_id: 1,
      latitude: 41.5317,
      longitude: 8.6179,
    });

    await db.city.create({
      name: 'Braga',
      country_id: 1,
      region_id: 1,
      latitude: 41.5454,
      longitude: 8.4265,
    });

    await db.city.create({
      name: 'Porto',
      country_id: 1,
      region_id: 2,
      latitude: 41.1579,
      longitude: 8.6291,
    });

    await db.city.create({
      name: 'Gaia',
      country_id: 1,
      region_id: 2,
      latitude: 41.1239,
      longitude: 8.6118,
    });

    await db.country.create({
      name: 'United States of America',
      code: 'USA',
    });

    await db.region.create({
      name: 'Texas',
      code: 'TX',
      country_id: 2,
    });

    await db.city.create({
      name: 'Dallas',
      country_id: 2,
      region_id: 3,
      latitude: 32.7767,
      longitude: 96.797,
    });

    // -------------------------
    // ----- System User -------
    // -------------------------

    await db.user.create({
      userId: 1,
      username: 'system',
      email: 'system@localhost.local',
      password: bcrypt.hashSync('dasjkT4231ldsNDOBNDOSABCXDS', 8),
    });

    // -------------------------
    // ------ Demo User --------
    // -------------------------
    const user2 = await db.user.create({
      username: 'user1',
      email: 'user1@localhost.local',
      password: bcrypt.hashSync('TESTING1234', 8),
    });
    await user2.setRoles([1]);

    await user2.createUserInfo({
      firstname: 'Jane',
      lastname: 'Doe',
      birthdate: new Date(1970, 1, 1),
      address: 'Shadow Isles',
      address2: '1',
      postcode: '1',
      city_id: 1,
      region_id: 1,
      country_id: 1,
    });

    // -------------------------
    // ------ Demo Admin -------
    // -------------------------
    const user3 = await db.user.create({
      username: 'admin1',
      email: 'admin1@localhost.local',
      password: bcrypt.hashSync('TESTING1234', 8),
    });
    await user3.setRoles([1, 2]);

    await user3.createUserInfo({
      firstname: 'Jason',
      lastname: 'Bourne',
      birthdate: new Date(1978, 6, 4),
      address: 'Maha H',
      address2: '56',
      postcode: '32857',
      city_id: 5,
      region_id: 3,
      country_id: 2,
    });
    await user3.createStudent();
    await user3.createSeller();

    // -------------------------
    // ------ Demo Sellers -----
    // -------------------------
    const user4 = await db.user.create({
      username: 'seller1',
      email: 'seller1@localhost.local',
      password: bcrypt.hashSync('TESTING1234', 8),
    });

    await user4.setRoles([1, 3]);

    await user4.createUserInfo({
      firstname: 'John',
      lastname: 'Wick',
      birthdate: new Date(1965, 11, 3),
      address: 'Lidston Avenue',
      address2: '56',
      postcode: '32857',
      city_id: 2,
      region_id: 1,
      country_id: 1,
    });
    await user4.createSeller({
      iban: '3213219492392192',
      enabled: true,
    });

    const user5 = await db.user.create({
      username: 'seller2',
      email: 'seller2@localhost.local',
      password: bcrypt.hashSync('TESTING1234', 8),
    });

    await user5.setRoles([1, 3]);

    await user5.createUserInfo({
      firstname: 'João',
      lastname: 'Pinto',
      birthdate: new Date(1985, 8, 16),
      address: 'RUa da Colheita',
      address2: '7',
      postcode: '6750-321',
      city_id: 2,
      region_id: 1,
      country_id: 1,
    });
    const seller2 = await user5.createSeller({
      iban: '4213219492392193',
      enabled: true,
    });

    const seller2prop1 = await seller2.createProperty({
      type: 'Apartment',
      address: 'Rua das flores',
      address2: '52, R/C',
      postcode: '4860-562',
      city_id: 1,
      region_id: 1,
      country_id: 1,
      enabled: true,
    });
    await seller2prop1.createRoom({
      bed_number: 1,
      wc: false,
      hvac: false,
      desk: true,
      wardrobe: true,
      kitchen: false,
      description: 'Large room with a beutiful view',
      monthly_fee: 250,
      enabled: true,
    });
    await seller2prop1.createRoom({
      bed_number: 2,
      wc: false,
      hvac: false,
      desk: false,
      wardrobe: true,
      kitchen: false,
      description: '2 bed bedroom',
      monthly_fee: 400,
      enabled: false,
    });

    const seller2prop2 = await seller2.createProperty({
      type: 'Apartment',
      address: 'Rua dos clerigos',
      address2: '24, 2-E',
      postcode: '4750-325',
      city_id: 1,
      region_id: 1,
      country_id: 1,
      resellerId: 2,
      enabled: true,
    });

    await seller2prop2.createDelegation({
      authorized: true,
      fee: 10,
      resellerId: 2,
      ownerId: 3,
    });

    await seller2prop2.createRoom({
      bed_number: 1,
      wc: true,
      hvac: true,
      desk: true,
      wardrobe: true,
      kitchen: false,
      description: 'Nice bedroom in the city center',
      monthly_fee: 350,
      enabled: true,
    });

    const seller2prop3 = await seller2.createProperty({
      type: 'Apartment',
      address: 'Rua das flores',
      address2: '52, R/C',
      postcode: '4860-562',
      city_id: 1,
      region_id: 1,
      country_id: 1,
      enabled: true,
    });

    await seller2prop3.createDelegation({
      authorized: false,
      fee: 10,
      resellerId: 2,
      ownerId: 3,
    });

    await seller2prop3.createRoom({
      bed_number: 1,
      wc: false,
      hvac: false,
      desk: true,
      wardrobe: true,
      kitchen: false,
      description: 'Large room with a beautiful view',
      monthly_fee: 250,
      enabled: true,
    });
    await seller2prop3.createRoom({
      bed_number: 2,
      wc: false,
      hvac: false,
      desk: false,
      wardrobe: true,
      kitchen: false,
      description: '2 bed bedroom',
      monthly_fee: 400,
      enabled: true,
    });

    const seller2prop4 = await seller2.createProperty({
      type: 'Apartment',
      address: 'Rua das flores',
      address2: '53, R/C',
      postcode: '4860-562',
      city_id: 1,
      region_id: 1,
      country_id: 1,
      enabled: true,
    });

    await seller2prop4.createDelegation({
      authorized: false,
      fee: 15,
      resellerId: 2,
      ownerId: 3,
    });

    await seller2prop4.createRoom({
      bed_number: 2,
      wc: false,
      hvac: true,
      desk: false,
      wardrobe: true,
      kitchen: false,
      description: '2 bed bedroom',
      monthly_fee: 450,
      enabled: true,
    });

    await seller2prop4.createRoom({
      bed_number: 1,
      wc: false,
      hvac: false,
      desk: false,
      wardrobe: false,
      kitchen: false,
      description: '2 bed bedroom',
      monthly_fee: 250,
      enabled: true,
    });

    await seller2prop4.createRoom({
      bed_number: 1,
      wc: false,
      hvac: false,
      desk: false,
      wardrobe: false,
      kitchen: false,
      description: '2 bed bedroom',
      monthly_fee: 250,
      enabled: true,
    });

    const seller2prop5 = await seller2.createProperty({
      type: 'Apartment',
      address: 'Rua das flores',
      address2: '55, R/C',
      postcode: '4860-562',
      city_id: 1,
      region_id: 1,
      country_id: 1,
      enabled: true,
    });

    await seller2prop5.createDelegation({
      authorized: false,
      fee: 15,
      resellerId: 2,
      ownerId: 3,
    });

    await seller2.createProperty({
      type: 'Apartment',
      address: 'Rua das flores',
      address2: '57, R/C',
      postcode: '4860-562',
      city_id: 1,
      region_id: 1,
      country_id: 1,
      enabled: true,
    });

    // -------------------------
    // ----- Demo Students -----
    // -------------------------
    const user6 = await db.user.create({
      username: 'student1',
      email: 'student1@localhost.local',
      password: bcrypt.hashSync('TESTING1234', 8),
    });

    await user6.setRoles([1, 4]);
    await user6.createUserInfo({
      firstname: 'Alexandre',
      lastname: 'Silvestre',
      birthdate: new Date(1999, 1, 2),
      address: 'Travessa das amigas',
      address2: '34',
      postcode: '6430-321',
      city_id: 2,
      region_id: 1,
      country_id: 1,
    });

    await user6.createCreatedConversation({
      subject: 'Interested in this room',
      recipientId: 4,
      roomId: 3,
    });

    await user6.createSentMessage({
      content:
        "I'm interested in renting this room, can you give me a discount?",
      senderId: user6.userId,
      receiverId: 4,
    });

    const student1 = await user6.createStudent({
      school_name: 'IPCA',
      school_email: 'student1ipca@localhost.local',
    });

    const student1rent1 = await student1.createRental({
      from: '2022-04-15 00:00:00',
      to: '2022-09-15 00:00:00',
      monthly_fee: 350,
      roomId: 3,
      rental_status: 1,
      payment_status: 1,
    });

    const student1rent1bD = [];
    for (
      let adate = Date.parse('2022-04-15 00:00:00');
      adate <= Date.parse('2022-09-15 00:00:00');
      adate += 86400000
    ) {
      student1rent1bD.push({
        year: new Date(adate).getFullYear(),
        month: new Date(adate).getMonth() + 1,
        day: new Date(adate).getDate(),
        roomId: 3,
      });
    }
    student1rent1bD.forEach(async (bookingDate) => {
      await student1rent1.createBookedDate(bookingDate);
    });

    const student1rent1p1 = await student1rent1.createPayment({
      card_number: 4111111111111111,
      card_owner: 'João Malheiro',
      ccv: 124,
      amount: 70,
      type: 0,
      status: 1,
      createdAt: '2022-04-05 02:00:00',
    });
    await student1rent1p1.createPayout({
      type: 1,
      system_fee: 10,
      delegation_fee: 10,
      full_amount: 70,
      paid_amount: 56,
      createdAt: '2022-04-05 02:00:00',
      status: 1,
      sellerId: 2,
    });
    await student1rent1p1.createPayout({
      type: 1,
      system_fee: 10,
      delegation_fee: 10,
      full_amount: 70,
      paid_amount: 7,
      createdAt: '2022-04-05 02:00:00',
      status: 0,
      sellerId: 1,
    });
    const student1rent1p2 = await student1rent1.createPayment({
      card_number: 4111111111111111,
      card_owner: 'João Malheiro',
      ccv: 124,
      amount: 350,
      type: 1,
      status: 0,
      createdAt: '2022-05-15 02:00:00',
    });
    await student1rent1p2.createPayout({
      type: 1,
      system_fee: 10,
      delegation_fee: 10,
      full_amount: 350,
      paid_amount: 280,
      createdAt: '2022-05-15 02:00:00',
      status: 0,
      sellerId: 2,
    });
    await student1rent1p2.createPayout({
      type: 1,
      system_fee: 10,
      delegation_fee: 10,
      full_amount: 350,
      paid_amount: 35,
      createdAt: '2022-05-15 02:00:00',
      status: 1,
      sellerId: 1,
    });

    await student1rent1.createPayment({
      card_number: 4111111111111111,
      card_owner: 'João Malheiro',
      ccv: 124,
      amount: 350,
      type: 1,
      status: 0,
      createdAt: '2022-05-19 02:00:00',
    });

    await student1rent1.createPayment({
      card_number: 4111111111111111,
      card_owner: 'João Malheiro',
      ccv: 124,
      amount: 50,
      type: 3,
      status: 0,
      createdAt: new Date(),
    });

    const user7 = await db.user.create({
      username: 'student2',
      email: 'student2@localhost.local',
      password: bcrypt.hashSync('TESTING1234', 8),
    });
    await user7.setRoles([1, 4]);
    await user7.createUserInfo({
      firstname: 'Ana',
      lastname: 'Feliz',
      birthdate: new Date(1996, 11, 26),
      address: 'Caminho da guarda',
      address2: '5, 3-D',
      postcode: '7564-234',
      city_id: 1,
      region_id: 1,
      country_id: 1,
    });
    const student2 = await user7.createStudent({
      school_name: 'UM',
      school_email: 'student2um@localhost.local',
      enabled: true,
    });
    const student2rent1 = await student2.createRental({
      createdAt: '2022-04-28 02:00:00',
      from: '2022-05-28 00:00:00',
      to: '2022-09-28 00:00:00',
      monthly_fee: 250,
      roomId: 2,
      rental_status: 0,
      payment_status: 0,
    });

    const student2rent1bD = [];
    for (
      let adate = Date.parse('2022-01-28 00:00:00');
      adate <= Date.parse('2022-08-28 00:00:00');
      adate += 86400000
    ) {
      student2rent1bD.push({
        year: new Date(adate).getFullYear(),
        month: new Date(adate).getMonth() + 1,
        day: new Date(adate).getDate(),
        roomId: 3,
      });
    }
    student2rent1bD.forEach(async (bookingDate) => {
      await student2rent1.createBookedDate(bookingDate);
    });

    const user8 = await db.user.create({
      username: 'pintinhodacosta',
      email: 'pintinhodacosta@localhost.local',
      password: bcrypt.hashSync('TESTING1234', 8),
    });

    await user8.setRoles([1, 4]);

    await user8.createUserInfo({
      firstname: 'Pintinho',
      lastname: 'DaCosta',
      birthdate: new Date(1969, 2, 1),
      address: 'Puorto',
      address2: '5, 3-D',
      postcode: '7564-234',
      city_id: 1,
      region_id: 1,
      country_id: 1,
    });
    await user8.createStudent({
      school_name: 'UM',
      school_email: 'student3sd@localhost.local',
      enabled: true,
    });

    const user9 = await db.user.create({
      username: 'luisfilipevieira',
      email: 'luisfilipevieira@localhost.local',
      password: bcrypt.hashSync('TESTING1234', 8),
    });

    await user9.setRoles([1, 4]);

    await user9.createUserInfo({
      firstname: 'Luís',
      lastname: 'Vieira',
      birthdate: new Date(1969, 2, 1),
      address: 'Prison',
      address2: '',
      postcode: '7523-234',
      city_id: 1,
      region_id: 1,
      country_id: 1,
    });
    const student3 = await user9.createStudent({
      school_name: 'UM',
      school_email: 'student5sd@localhost.local',
      enabled: true,
    });

    const student3rent1 = await student3.createRental({
      createdAt: '2022-04-28 02:00:00',
      from: '2023-01-28 00:00:00',
      to: '2023-03-28 00:00:00',
      monthly_fee: 250,
      roomId: 3,
      rental_status: 0,
      payment_status: 0,
    });

    const student3rent1bD = [];
    for (
      let adate = Date.parse('2023-01-28 00:00:00');
      adate <= Date.parse('2023-03-28 00:00:00');
      adate += 86400000
    ) {
      student3rent1bD.push({
        year: new Date(adate).getFullYear(),
        month: new Date(adate).getMonth() + 1,
        day: new Date(adate).getDate(),
        roomId: 3,
      });
    }
    student3rent1bD.forEach(async (bookingDate) => {
      await student3rent1.createBookedDate(bookingDate);
    });

    const user10 = await db.user.create({
      username: 'fvagandas',
      email: 'vagandassclisboa@localhost.local',
      password: bcrypt.hashSync('TESTING1234', 8),
    });

    await user10.setRoles([1, 4]);

    await user10.createUserInfo({
      firstname: 'Filipe',
      lastname: 'Vagandas',
      birthdate: new Date(1969, 2, 3),
      address: 'Simpsons Clinic',
      address2: '',
      postcode: '3523-234',
      city_id: 1,
      region_id: 1,
      country_id: 1,
    });

    const user11 = await db.user.create({
      username: 'silvesterstaline',
      email: 'silvesterstaline@localhost.local',
      password: bcrypt.hashSync('TESTING1234', 8),
    });

    await user11.setRoles([1, 4]);

    await user11.createUserInfo({
      firstname: 'Silvester',
      lastname: 'Staline',
      birthdate: new Date(1969, 2, 1),
      address: 'Risot',
      address2: '',
      postcode: '7523-234',
      city_id: 1,
      region_id: 1,
      country_id: 1,
    });
    const student4 = await user11.createStudent({
      school_name: 'UM',
      school_email: 'student11sd@localhost.local',
      enabled: true,
    });

    const student4rent1 = await student4.createRental({
      createdAt: '2022-04-28 02:00:00',
      from: '2024-01-28 00:00:00',
      to: '2024-03-28 00:00:00',
      monthly_fee: 250,
      roomId: 3,
      rental_status: 0,
      payment_status: 0,
    });

    const student4rent1bD = [];
    for (
      let adate = Date.parse('2024-01-28 00:00:00');
      adate <= Date.parse('2024-03-28 00:00:00');
      adate += 86400000
    ) {
      student4rent1bD.push({
        year: new Date(adate).getFullYear(),
        month: new Date(adate).getMonth() + 1,
        day: new Date(adate).getDate(),
        roomId: 3,
      });
    }
    student4rent1bD.forEach(async (bookingDate) => {
      await student4rent1.createBookedDate(bookingDate);
    });

    const student4rent2 = await student4.createRental({
      createdAt: '2022-04-28 02:00:00',
      from: '2025-01-28 00:00:00',
      to: '2025-03-28 00:00:00',
      monthly_fee: 250,
      roomId: 3,
      rental_status: 0,
      payment_status: 0,
    });

    const student4rent2bD = [];
    for (
      let adate = Date.parse('2025-01-28 00:00:00');
      adate <= Date.parse('2025-03-28 00:00:00');
      adate += 86400000
    ) {
      student4rent2bD.push({
        year: new Date(adate).getFullYear(),
        month: new Date(adate).getMonth() + 1,
        day: new Date(adate).getDate(),
        roomId: 3,
      });
    }
    student4rent2bD.forEach(async (bookingDate) => {
      await student4rent2.createBookedDate(bookingDate);
    });

    const student4rent3 = await student4.createRental({
      createdAt: '2022-04-28 02:00:00',
      from: '2022-01-28 00:00:00',
      to: '2022-08-28 00:00:00',
      monthly_fee: 250,
      roomId: 3,
      rental_status: 1,
      payment_status: 2,
    });

    const student4rent3bD = [];
    for (
      let adate = Date.parse('2022-01-28 00:00:00');
      adate <= Date.parse('2022-08-28 00:00:00');
      adate += 86400000
    ) {
      student4rent3bD.push({
        year: new Date(adate).getFullYear(),
        month: new Date(adate).getMonth() + 1,
        day: new Date(adate).getDate(),
        roomId: 3,
      });
    }
    student4rent3bD.forEach(async (bookingDate) => {
      await student4rent3.createBookedDate(bookingDate);
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = async () => {
  await create().then(() => demodataset());
};
