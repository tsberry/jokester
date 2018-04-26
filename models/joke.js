module.exports = function (sequelize, DataTypes) {
    var Joke = sequelize.define("Joke", {
        jokeText: {
            type: DataTypes.STRING,
            allowNull: false
        },
        jokeUpvoteCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        jokeDownvoteCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
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