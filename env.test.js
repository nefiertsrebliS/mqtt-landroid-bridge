const updateConfigWithEnvVars = require('./env');
const config = require('./config.json');

describe('updateConfigWithEnvVars', () => {
  it('should update string values with environment variables', () => {
    const config = {
      foo: 'default',
    };
    const env = { FOO: 'bar' };
    const updatedConfig = updateConfigWithEnvVars(config, undefined, undefined, env);
    expect(updatedConfig.foo).toEqual('bar');
  });

  it('should update nested object values with environment variables', () => {
    const config = {
      foo: {
        bar: 'default',
      },
    };
    const env = { FOO_BAR: 'baz' };
    const updatedConfig = updateConfigWithEnvVars(config, undefined, undefined, env);
    expect(updatedConfig.foo.bar).toEqual('baz');
  });

  it('should update array values with environment variables', () => {
    const config = {
      foo: ['default'],
    };
    const env = { FOO_0: 'bar' };
    const updatedConfig = updateConfigWithEnvVars(config, undefined, undefined, env);
    expect(updatedConfig.foo).toEqual(['bar']);
  });

  it('should update nested array values with environment variables', () => {
    const config = {
      foo: [
        {
          bar: 'default',
        },
      ],
    };
    const env = { FOO_0_BAR: 'baz' };
    const updatedConfig = updateConfigWithEnvVars(config, undefined, undefined, env);
    expect(updatedConfig.foo[0].bar).toEqual('baz');
  });

  it('should update arrays of objects with environment variables', () => {
    const config = {
      foo: [
        {
          bar: 'default',
        },
        {
          baz: 'default',
        },
      ],
    };
    const env = {
      FOO_0_BAR: 'updated',
      FOO_1_BAZ: 'updated',
    };
    const updatedConfig = updateConfigWithEnvVars(config, undefined, undefined, env);
    expect(updatedConfig.foo[0].bar).toEqual('updated');
    expect(updatedConfig.foo[1].baz).toEqual('updated');
  });

  it('should handle missing environment variables gracefully', () => {
    const config = {
      foo: 'default',
    };
    const env = {};
    const updatedConfig = updateConfigWithEnvVars(config, undefined, undefined, env);
    expect(updatedConfig.foo).toEqual('default');
  });

  it('should handle missing keys in the config gracefully', () => {
    const config = {
      foo: {
        bar: 'default',
      },
    };
    const env = { FOO: 'baz' };
    const updatedConfig = updateConfigWithEnvVars(config, undefined, undefined, env);
    expect(updatedConfig.foo.bar).toEqual('default');
  });

  it('should handle empty arrays in the config gracefully', () => {
    const config = {
      foo: [],
    };
    const env = { FOO_0: 'bar' };
    const updatedConfig = updateConfigWithEnvVars(config, undefined, undefined, env);
    expect(updatedConfig.foo).toEqual([]);
  });

  it('should handle app config', () => {
    const env = { MQTT_URL: 'bar' };
    const updatedConfig = updateConfigWithEnvVars(config, undefined, undefined, env);
    expect(updatedConfig.mqtt.url).toEqual('bar');
  });

  test('should update config with environment variables', () => {
    const config = {
      cloud: {
        email: 'default@mail.com',
        pwd: 'defaultPassword',
        type: 'defaultType',
      },
      mqtt: {
        url: 'mqtt://defaultUrl',
      },
      mower: [
        {
          sn: 'defaultSerialNumber',
          topic: 'defaultTopic',
        },
      ],
      logLevel: 'defaultLogLevel',
    };

    const env = {
      CLOUD_EMAIL: 'test@mail.com',
      CLOUD_PWD: 'testPassword',
      CLOUD_TYPE: 'testType',
      MQTT_URL: 'mqtt://testUrl',
      MOWER_0_SN: 'testSerialNumber',
      MOWER_0_TOPIC: 'testTopic',
      LOGLEVEL: 'testLogLevel',
    };

    const updatedConfig = updateConfigWithEnvVars(config, undefined, undefined, env);

    expect(updatedConfig).toEqual({
      cloud: {
        email: 'test@mail.com',
        pwd: 'testPassword',
        type: 'testType',
      },
      mqtt: {
        url: 'mqtt://testUrl',
      },
      mower: [
        {
          sn: 'testSerialNumber',
          topic: 'testTopic',
        },
      ],
      logLevel: 'testLogLevel',
    });
  });
});