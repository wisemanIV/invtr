require 'uri'
require 'sinatra'
require 'rest_client'

get '/force' do
params = request.env['rack.request.query_hash']

url = params['url']
callback = params['callback']
token = params['token']
puts "token #{token}"
response['Access-Control-Allow-Origin'] = '*'

RestClient.get(URI.escape(url),{:accept => :json, :Authorization => "Bearer #{token}"})
end

post '/force' do
params = request.env['rack.request.query_hash']

url = params['url']
body = request.body.read;
puts "POST FORCE url: #{url} #{body}"
response['Access-Control-Allow-Origin'] = 'https://www.invtr.co'
response['Access-Control-Allow-Credentials'] = 'true'
response['Access-Control-Allow-Headers'] ='Origin, X-Requested-With, Content-Type, Accept'

#RestClient.post(URI.escape(url),URI.escape(body),{"Content-type" => "application/x-www-form-urlencoded"})
begin
res = RestClient.post URI.escape(url), body, {:accept => :json}
rescue => e
  e.response
end

end

options '/' do
params = request.env['rack.request.query_hash']

url = params['url']
puts "OPTIONS url: #{url}"
response['Access-Control-Allow-Origin'] = 'https://www.invtr.co'

"Done"

end

options '/force' do
params = request.env['rack.request.query_hash']

url = params['url']
puts "OPTIONS FORCE url: #{url}"
response['Access-Control-Allow-Origin'] = '*'
response['Access-Control-Allow-Credentials'] = 'true'
response['Access-Control-Allow-Headers'] ='Origin, X-Requested-With, Content-Type, Accept'


"Done"

end
