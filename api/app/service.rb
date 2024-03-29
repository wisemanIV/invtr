require 'uri'
require 'sinatra'
require 'rest_client'
require "omniauth"
require "omniauth-salesforce"

#class InviterApplication < Sinatra::Base
  #use Rack::Session
  #use OmniAuth::Builder do
  #  provider :salesforce, ENV['SALESFORCE_KEY'], ENV['SALESFORCE_SECRET']
  #end
  
  
  get '/force/user' do
    params = request.env['rack.request.query_hash']

    url = params['url']
    callback = params['callback']
    token = params['token']
    puts "token #{token}"
    response['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Credentials'] = 'true'
    response['Access-Control-Allow-Headers'] ='Origin, X-Requested-With, Content-Type, Accept'
    

    RestClient.get(URI.escape(url),{:accept => :json, :Authorization => "Bearer #{token}"})
  end

  end

  options '/' do
  params = request.env['rack.request.query_hash']

  url = params['url']
  puts "OPTIONS url: #{url}"
  response['Access-Control-Allow-Origin'] = '*'
  response['Access-Control-Allow-Credentials'] = 'true'
  response['Access-Control-Allow-Headers'] ='Origin, X-Requested-With, Content-Type, Accept'
 

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

  post '/sitebuilder' do
  #params = request.env['rack.request.query_hash']

  subdomain = params['subdomain']
  #auth = params['auth']
  #token = params['token']
  puts "BUILDING SITE AT SUBDOMAIN: #{subdomain}"
  response['Access-Control-Allow-Origin'] = '*'
  
  command = "/var/bin/sitegen.sh "+subdomain
  puts "EXECUTING #{command}"

  pid = spawn(command)
  Process.wait pid
  
  if (!$?.exited?) then
    puts "COMPLETED #{$?.exitstatus}"
    halt 500 
  end
  
  halt 200 
  end
  
  #end
