'use strict';

/** @type {import('sequelize-cli').Migration} */
const { v4: uuidv4 } = require('uuid');
const fs = require("fs");

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    let teams = JSON.parse(
      fs.readFileSync("./seeders/data/teams.json", "utf8")
    );
    let teamsData = teams.map((team) => {
      const { LeagueId } = team;
      return {
        id: uuidv4(),
        ...team,
        status: 'Waiting Approval',
        logo: 'blank.png',
        LeagueId: LeagueId ?? '13adc6f9-12b7-49e3-b2ab-68ae5ca256fe',
        owner: '851487d7-63de-42b2-a9f5-8ab55cb1ea4f',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });
    await queryInterface.bulkInsert("Teams", teamsData, {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Teams", null, {});
  }
};
