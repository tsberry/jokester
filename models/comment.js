module.exports = function (sequelize, DataTypes) {
    var Comment = sequelize.define("Comment", {
        commentText: {
            type: DataTypes.STRING,
            allowNull: false
        },
        commentUpvoteCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        commentDownvoteCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        commentNetCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });

    Comment.associate = function (models) {
        Comment.belongsTo(models.User, {
            foreignKey: {
                allowNull: false
            }
        });

        Comment.belongsTo(models.Joke, {
            foreignKey: {
                allowNull: false
            }
        });
    };

    return Comment;
};