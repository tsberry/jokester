module.exports = function (sequelize, DataTypes) {
    var Joke = sequelize.define("Joke", {
        jokeText: {
            type: DataTypes.STRING,
            allowNull: false
        },
        jokeUpvoteCount: {
            type: DataTypes.INTEGER
        },
        jokeDownvoteCount: {
            type: DataTypes.INTEGER
        }
    });

    Joke.associate = function (models) {
        Joke.belongsTo(models.User, {
            foreignKey: {
                allowNull: false
            }
        });
    };

    return Joke;
};