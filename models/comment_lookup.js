module.exports = function (sequelize, DataTypes) {
    var comments_lookup_table = sequelize.define("comments_lookup_table", {
        isUpvote: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        }
    });

    comments_lookup_table.associate = function (models) {
        comments_lookup_table.belongsTo(models.User, {
            foreignKey: {
                allowNull: false
            }
        });

        comments_lookup_table.belongsTo(models.Comment, {
            foreignKey: {
                allowNull: false
            }
        });
    };

    return comments_lookup_table;
};