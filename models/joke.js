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
        },
        jokeNetCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        category: {
            type: DataTypes.STRING
        }
    });

    Joke.associate = function (models) {
        Joke.belongsTo(models.User, {
            foreignKey: {
                allowNull: false
            }
        });
        Joke.hasMany(models.Comment, {
            foreignKey: {
                allowNull: false
            }
        });
    };

    return Joke;
};