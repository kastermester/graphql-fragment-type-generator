FROM mhart/alpine-node:7.5.0

RUN npm install -g yarn@0.19.1

RUN mkdir /code
ADD src /code/src
ADD test /code/test
ADD types /code/types
ADD package.json /code
ADD tslint.json /code
ADD tsconfig.json /code
ADD yarn.lock /code
ADD mocha.sh /code
WORKDIR /code

RUN yarn

