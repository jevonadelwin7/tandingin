const { League, User, Team, Fixture, Match } = require("../models");
const {
  convertObjectToSnakeCase,
  convertObjectToCamelCase,
} = require("../helpers/ResponseHelpers");
const { successResponse } = require("../response");

class MemberController {
  static async create(req, res, next) {
    try {
      const { file } = req;
      const UserId = req.userData.id;
      const { name, shortname } = req.body;

      await Team.create({
        name,
        shortname,
        UserId,
        logo: file ? `images/team/${file.filename}` : "images/ImageNotSet.png",
      });

      return successResponse(res, "Team successfully created", 201);
    } catch (err) {
      return next(err);
    }
  }

  static async joinLeague(req, res, next) {
    try {
      const { TeamId, LeagueId, key } = req.body;
      const teamData = await Team.findOne({
        where: { id: TeamId },
      });

      if (teamData.LeagueId) {
        return res.status(403).json({
          message: "This team are joining another league!",
        });
      }

      const leagueData = await League.findOne({
        where: { id: LeagueId },
      });

      if (!leagueData) {
        return res.status(403).json({
          message: "League does not exist!",
        });
      }
      const { quota_available, is_locked, key: leagueKey } = leagueData;

      if (is_locked) {
        if (!key) {
          return res.status(400).json({
            message: "Key is required",
          });
        }
        if (key !== leagueKey) {
          return res.status(400).json({
            message: "Key is incorrect",
          });
        }
      }

      if (quota_available === 0) {
        return res.status(400).json({
          message: "Quota is full",
        });
      }

      await Team.update(
        {
          status: "Pending",
          LeagueId,
        },
        { where: { id: TeamId } }
      );

      return successResponse(res, "waiting approval from admin league");
    } catch (err) {
      return next(err);
    }
  }

  static async viewMatch(req, res, next) {
    try {
      const matches = await Match.findAll({
        include: [
          {
            model: Team,
            // through: { attributes: ["isHomeTeam"] },
            where: { id: req.params.TeamId },
          },
        ],
      });

      return matches.map((match) => ({
        matchDate: match.match_date,
        leagueId: match.LeagueId,
        teams: match.Teams.map((team) => ({
          teamName: team.name,
          // isHomeTeam: team.TeamMatch.isHomeTeam,
          logo: team.logo,
        })),
      }));

      return successResponse(res, "Show Match", 200, matchDataTeam);
    } catch (err) {
      return next(err);
    }
  }

  static async viewAllTeam(req, res, next) {
    try {
      const dataTeam = await Team.findAll({});

      return successResponse(res, "Show Data", 200, dataTeam);
    } catch (err) {
      return next(err);
    }
  }

  static async viewTeamUser(req, res, next) {
    const UserId = req.userData.id;
    try {
      const dataTeam = await Team.findAll({ where: { UserId } });

      return successResponse(res, "Show Data", 200, {
        totalData: dataTeam.length,
        dataTeam,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async deleteTeam(req, res, next) {
    const { id } = req.params;
    try {
      const { UserId } = await Team.findByPk(id);
      if (UserId === req.userData.id) {
        const destroyTeam = await Team.destroy({ where: { id, UserId } });
        if (destroyTeam === 0) {
          return res.status(404).json({
            message: "Team is not found",
          });
        }
        return successResponse(res, "Team has been deleted");
      }

      return res.status(403).json({
        message: "Your forbidden",
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = MemberController;
