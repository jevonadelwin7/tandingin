const { League, User, Team, Fixture } = require('../models');
const {
  convertObjectToSnakeCase,
  convertObjectToCamelCase,
} = require('../helpers/ResponseHelpers');
const { successResponse } = require('../response');
const { generateRandomFixture, generateFixture } = require('../helpers/fixtureGenerator');
// const fs = require("fs-extra");
// const path = require("path");
const robin = require('roundrobin');
class AdminController {
  static async create(req, res, next) {
    try {
      let file = req.file;
      const id = req.userData.id;
      const users = await User.findByPk(id);

      const { name, quota } = req.body;

      const isLeagueExist = await League.findOne({
        where: { name },
      });

      if (isLeagueExist) {
        return res.status(403).json({
          message: 'League already exist!',
        });
      }

      const dataConvert = convertObjectToSnakeCase(req.body);
      await League.create({
        ...dataConvert,
        quota_available: quota,
        logo: file ? file.filename : 'ImageNotSet.png',
        status: 'open',
        createdBy: users.username,
        updatedBy: users.username,
        UserId: users.id,
      });

      return successResponse(res, 'League successfully created', 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    // const UserId = req.userData.id;
    const LeagueId = req.params.leagueId;
    // const file = req.file;
    // console.log(file)
    // const users = await User.findByPk({ id: UserId });
    const { name, quota, description, startDate, endDate, prize } = req.body;
    console.log(name)
    try {
      const dataConvert = convertObjectToSnakeCase(req.body);
      await League.update(
        {
          ...dataConvert,
          // logo: file ? file.filename : "blank.png",
        },
        { where: { id: LeagueId } }
      );

      return successResponse(res, 'League successfully updated');
    } catch (err) {
      next(err);
    }
  }

  static async updateLogo(req, res, next) {
    const LeagueId = req.params.leagueId;
    const file = req.file;

    try {
      await League.update(
        {
          logo: file ? file.filename : 'blank.png',
        },
        { where: { id: LeagueId } }
      );

      return successResponse(res, 'Logo successfully updated');
    } catch (err) {
      next(err);
    }
  }

  static async viewListLeague(req, res, next) {
    try {
      // const leagues = await League.findAll({
      //     include: [{
      //         model: Team,
      //         where: {
      //             status: 'Approved'
      //         }
      //     }]
      // })
      const leagues = await League.findAll({});
      return res.status(200).json(leagues);
    } catch (err) {
      next(err);
    }
  }

  static async viewListTeamInLeague(req, res, next) {
    try {
      const { LeagueId, status } = req.query;
      const leaguesData = await League.findOne(
        {
          include: [
            {
              model: Team,
              where: {
                status,
              },
            },
          ],
        },
        {
          where: { id: LeagueId },
        }
      );
      return successResponse(res, 'League list success', 200, leaguesData);
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { status, TeamId, LeagueId } = req.body;
      const isLeagueExist = await League.findOne({ where: { id: LeagueId } });
      if (!isLeagueExist) {
        return res.status(404).json({
          message: 'League does not exist',
        });
      }

      const isTeamExist = await Team.findOne({ where: { id: TeamId } });
      if (!isTeamExist) {
        return res.status(404).json({
          message: 'Team does not exist',
        });
      }
      await Team.update(
        {
          status,
        },
        { where: { id: TeamId } }
      );

      switch (status) {
        case 'Approved':
          await League.decrement(
            {
              quota_available: 1,
            },
            { where: { id: LeagueId } }
          );

          const leagueAfterDecrement = await League.findOne({ where: { id: LeagueId } });
          if (leagueAfterDecrement.quota_available === 0) {
            await League.update(
              {
                status: 'closed',
              },
              { where: { id: LeagueId } }
            );
          }
          break;
        case 'Rejected':
          await Team.update(
            {
              LeagueId: null,
            },
            { where: { id: TeamId } }
          );
          break;
      }

      return successResponse(res, `${status} by ADMIN League`);
    } catch (err) {
      next(err);
    }
  }

  static async generateMatch(req, res, next) {
    try {
      const LeagueId = req.params.leagueId;
      const allTeams = await Team.findAll({ where: { LeagueId } })
      const isMatchExist = await Fixture.findAll({ where: { LeagueId } })
      if (isMatchExist.length > 0) {
        await Fixture.destroy({
          where: { LeagueId },
        });
      }
      const teamsName = allTeams.map(team => team.name)
      const shuffleTeams = teamsName.sort(() => Math.random() - 0.5);
      const turnament = robin(shuffleTeams.length, shuffleTeams);
      const matchAllTeam = generateFixture(turnament, LeagueId);
      await Fixture.bulkCreate(matchAllTeam)
      return successResponse(res, 'Generate fixture success', 200, matchAllTeam);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminController;
