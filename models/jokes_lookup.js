module.exports = function (sequelize, DataTypes) {
    var jokes_lookup_table = sequelize.define("jokes_lookup_table", {
        isUpvote: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        }
    });

    jokes_lookup_table.associate = function (models) {
        jokes_lookup_table.belongsTo(models.User, {
            foreignKey: {
                allowNull: false
            }
        });

        jokes_lookup_table.belongsTo(models.Joke, {
            foreignKey: {
                allowNull: false
            }
        });
    };

    return jokes_lookup_table;
};