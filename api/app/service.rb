require 'uri'
require 'sinatra'
require 'rest_client'

get '/force' do
params = request.env['rack.request.query_hash']

url = params['url']
callback = params['callback']
token = params['token']
puts "token #{token}"
response['Access-Control-Allow-Origin'] = 'https://www.invtr.co'

RestClient.get(URI.escape(url),{:accept => :json, :Authorization => "OAuth #{token}"})
end

get '/sitebuilder' do
params = request.env['rack.request.query_hash']

subdomain = params['subdomain']
auth = params['auth']
token = params['token']
puts "BUILDING SITE AT SUBDOMAIN: #{subdomain}"
response['Access-Control-Allow-Origin'] = 'https://www.invtr.co'

command = "/var/bin/sitegen.sh "+subdomain
puts "EXECUTING #{command}"

pid = spawn(command)
puts "COMPLETED #{$?.exitstatus}"
$?.exitstatus
end
