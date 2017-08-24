require 'mongo'

client = Mongo::Client.new(['localhost:27017'], :database => 'happyplace_db')

Mongo::Logger.logger.level = ::Logger::DEBUG

# client.collections.each{ |coll| puts coll.name }

client[:users].find.each { |doc| puts doc }



client.close